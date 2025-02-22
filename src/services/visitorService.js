import { supabase } from '../config/supabase';
import { mockIdApi } from './mockApi';
import { generateDepartmentCards } from '../utils/constants';
import Tesseract from 'tesseract.js';

export const visitorService = {
  // Extract text from captured image using Tesseract OCR
  extractTextFromImage: async (imageData) => {
    try {
      const worker = await Tesseract.createWorker();
      
      // Initialize worker with English language
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Recognize text from image
      const { data: { text } } = await worker.recognize(imageData);
      
      // Cleanup
      await worker.terminate();
      
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  },

  // Parse Rwandan ID/Passport text
  parseDocumentText: (text) => {
    try {
      const data = {
        fullName: '',
        identityNumber: '',
        gender: '',
        nationality: ''
      };

      // Split text into lines
      const lines = text.split('\n');

      // Process each line
      lines.forEach(line => {
        line = line.toLowerCase().trim();

        // Extract full name
        if (line.includes('names:') || line.includes('nom:')) {
          data.fullName = line.split(/names:|nom:/i)[1].trim();
        }
        
        // Extract ID number
        else if (line.includes('no:') || line.includes('number:')) {
          data.identityNumber = line.split(/no:|number:/i)[1].trim()
            .replace(/[^0-9]/g, ''); // Keep only numbers
        }
        
        // Extract gender
        else if (line.includes('sex:') || line.includes('gender:')) {
          const gender = line.split(/sex:|gender:/i)[1].trim();
          data.gender = gender.startsWith('m') ? 'Male' : 'Female';
        }
        
        // Extract nationality
        else if (line.includes('nationality:') || line.includes('nationalite:')) {
          data.nationality = line.split(/nationality:|nationalite:/i)[1].trim();
        }
      });

      return data;
    } catch (error) {
      console.error('Document parsing error:', error);
      throw new Error('Failed to parse document text');
    }
  },

  // Upload captured photo to storage
  uploadPhoto: async (photoData) => {
    try {
      // Convert base64 to blob
      const base64Response = await fetch(photoData);
      const blob = await base64Response.blob();

      // Generate unique filename
      const filename = `visitor-photos/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('visitors')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('visitors')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw new Error('Failed to upload photo');
    }
  },

  // Search for a visitor (updated to handle passport scanning)
  searchVisitor: async (searchTerm) => {
    try {
      console.log('Search initiated with term:', searchTerm);

      // Handle passport case
      if (searchTerm === '#00') {
        console.log('Passport case detected');
        return { isPassport: true };
      }

      // Rest of your existing searchVisitor code...
      // [Keep all the existing code for searching visitors]
    } catch (error) {
      console.error('Visitor search error:', error);
      throw error;
    }
  },

  // Check in visitor (updated to handle uploaded photos)
  async checkInVisitor(visitorData, username) {
    try {
      // Verify card is still available
      const availableCards = await this.getAvailableCards(visitorData.department);
      if (!availableCards.includes(visitorData.visitorCard)) {
        throw new Error('Selected visitor card is no longer available');
      }

      let photoUrl = null;

      // Handle photo based on visitor type
      if (visitorData.isPassport && visitorData.photoUrl) {
        // Upload captured passport/ID photo
        photoUrl = await this.uploadPhoto(visitorData.photoUrl);
      } else if (!visitorData.isPassport && visitorData.identityNumber) {
        // Get photo from mock API for regular visitors
        photoUrl = await mockIdApi.getPhoto(visitorData.identityNumber);
      }

      const checkInData = {
        full_name: visitorData.fullName,
        identity_number: visitorData.identityNumber,
        gender: visitorData.gender,
        phone_number: visitorData.phoneNumber,
        nationality: visitorData.nationality,
        visitor_card: visitorData.visitorCard,
        department: visitorData.department,
        purpose: visitorData.purpose,
        items: visitorData.items || null,
        laptop_brand: visitorData.laptopBrand || null,
        laptop_serial: visitorData.laptopSerial || null,
        check_in_by: username,
        has_laptop: !!visitorData.laptopBrand,
        is_passport: visitorData.isPassport || false,
        photo_url: photoUrl
      };

      const { data, error } = await supabase
        .from('visitors')
        .insert([checkInData])
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking in visitor:', error);
      throw error;
    }
  },



  // Get available visitor cards for a department
  async getAvailableCards(departmentId) {
    try {
      // Get all possible cards for the department
      const allCards = generateDepartmentCards(departmentId);
      
      // Get cards currently in use
      const { data: inUseCards } = await supabase
        .from('visitors')
        .select('visitor_card')
        .eq('department', departmentId)
        .is('check_out_time', null);

      // Filter out cards that are in use
      const inUseCardSet = new Set(inUseCards?.map(v => v.visitor_card) || []);
      const availableCards = allCards.filter(card => !inUseCardSet.has(card));

      return availableCards;
    } catch (error) {
      console.error('Error getting available cards:', error);
      throw error;
    }
  },

  // Get used cards for a department
  async getUsedCards(departmentId) {
    try {
      const { data: inUseCards, error } = await supabase
        .from('visitors')
        .select('visitor_card')
        .eq('department', departmentId)
        .is('check_out_time', null);

      if (error) throw error;

      return inUseCards?.map(v => v.visitor_card) || [];
    } catch (error) {
      console.error('Error getting used cards:', error);
      throw error;
    }
  },

  // Check out visitor
  async checkOutVisitor(visitorId, username) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .update({
          check_out_time: new Date().toISOString(),
          check_out_by: username
        })
        .eq('id', visitorId)
        .is('check_out_time', null)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking out visitor:', error);
      throw error;
    }
  },

  // Get active visitors
  async getActiveVisitors() {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false });

      if (error) throw error;

      // Get fresh photos for all visitors
      const visitorsWithPhotos = await Promise.all(
        data.map(async (visitor) => {
          if (visitor.identity_number) {
            const photoUrl = await mockIdApi.getPhoto(visitor.identity_number);
            return { ...visitor, photoUrl };
          }
          return visitor;
        })
      );

      return visitorsWithPhotos;
    } catch (error) {
      console.error('Error getting active visitors:', error);
      throw error;
    }
  },

  // Get visitor history
  async getVisitorHistory(searchParams) {
    try {
      let query = supabase
        .from('visitors')
        .select('*')
        .order('check_in_time', { ascending: false });

      // Apply filters
      if (searchParams.department) {
        query = query.eq('department', searchParams.department);
      }

      if (searchParams.dateRange) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (searchParams.dateRange) {
          case 'today':
            query = query.gte('check_in_time', startOfDay.toISOString());
            break;
          case 'week':
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            query = query.gte('check_in_time', startOfWeek.toISOString());
            break;
          case 'month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            query = query.gte('check_in_time', startOfMonth.toISOString());
            break;
        }
      }

      // Add pagination
      if (searchParams.page && searchParams.limit) {
        const from = searchParams.page * searchParams.limit;
        query = query.range(from, from + searchParams.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get fresh photos for visitors with ID numbers
      const visitorsWithPhotos = await Promise.all(
        data.map(async (visitor) => {
          if (visitor.identity_number) {
            const photoUrl = await mockIdApi.getPhoto(visitor.identity_number);
            return { ...visitor, photoUrl };
          }
          return visitor;
        })
      );

      return {
        visitors: visitorsWithPhotos,
        total: count
      };
    } catch (error) {
      console.error('Error getting visitor history:', error);
      throw error;
    }
  }
};
