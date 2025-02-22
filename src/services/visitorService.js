import { createWorker } from 'tesseract.js';
import { supabase } from '../config/supabase';
import { generateDepartmentCards } from '../utils/constants';

export const visitorService = {
  // Extract text from captured image using Tesseract OCR with coordinate-based recognition
  extractTextFromImage: async (imageData) => {
    const worker = await createWorker();
    
    try {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Define exact coordinates for each field
      // These values might need adjustment based on your image capture size
      const sections = {
        name: { top: 120, left: 180, width: 400, height: 40 },    // For "Amazina / Names"
        gender: { top: 240, left: 180, width: 200, height: 40 },  // For "Igitsina / Sex"
        idNumber: { top: 360, left: 180, width: 400, height: 40 } // For "ID No."
      };

      // Set parameters for better text recognition
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/abcdefghijklmnopqrstuvwxyz ',
        preserve_interword_spaces: '1',
      });

      // Extract text from each section
      console.log('Extracting name...');
      const nameResult = await worker.recognize(imageData, {
        rectangle: sections.name
      });

      console.log('Extracting gender...');
      const genderResult = await worker.recognize(imageData, {
        rectangle: sections.gender
      });

      console.log('Extracting ID number...');
      const idResult = await worker.recognize(imageData, {
        rectangle: sections.idNumber
      });

      // Process the extracted text
      const nameText = nameResult.data.text;
      const genderText = genderResult.data.text;
      const idText = idResult.data.text;

      console.log('Extracted texts:', {
        name: nameText,
        gender: genderText,
        id: idText
      });

      // Parse the data
      const parsedData = visitorService.parseDocumentText({
        nameText,
        genderText,
        idText
      });

      await worker.terminate();
      return parsedData;

    } catch (error) {
      console.error('OCR Error:', error);
      if (worker) {
        await worker.terminate();
      }
      throw error;
    }
  },

  // Parse extracted text into structured data
  parseDocumentText: ({ nameText, genderText, idText }) => {
    try {
      const data = {
        fullName: '',
        identityNumber: '',
        gender: '',
        nationality: 'Rwandan'
      };

      // Extract name
      const nameLines = nameText.split('\n');
      for (const line of nameLines) {
        if (line.includes('AMAZINA') || line.includes('NAMES')) {
          const nextLine = nameLines[nameLines.indexOf(line) + 1];
          if (nextLine) {
            data.fullName = nextLine.trim();
            break;
          }
        } else if (/^[A-Z\s]+$/.test(line.trim())) {
          // If we find a line with all capitals, it's likely the name
          data.fullName = line.trim();
          break;
        }
      }

      // Extract gender
      if (genderText.toLowerCase().includes('gabo') || genderText.toLowerCase().includes('m')) {
        data.gender = 'Male';
      } else if (genderText.toLowerCase().includes('gore') || genderText.toLowerCase().includes('f')) {
        data.gender = 'Female';
      }

      // Extract ID number
      const idMatch = idText.match(/1\d{15}/) || idText.match(/1[\s\d]{15}/);
      if (idMatch) {
        data.identityNumber = idMatch[0].replace(/\s/g, '');
      }

      // Validate extracted data
      if (!data.fullName || !data.identityNumber || !data.gender) {
        console.log('Validation failed:', data);
        throw new Error('Could not extract all required fields');
      }

      return data;
    } catch (error) {
      console.error('Document parsing error:', error);
      throw error;
    }
  },

  // Upload photo to storage
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
      throw error;
    }
  },

  // Search for a visitor
  searchVisitor: async (searchTerm) => {
    try {
      if (searchTerm === '#00') {
        return { isPassport: true };
      }

      // Check for active check-in
      const { data: activeVisitor, error: activeError } = await supabase
        .from('visitors')
        .select('*')
        .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
        .is('check_out_time', null)
        .single();

      if (activeVisitor) {
        return {
          error: 'Visitor already has an active check-in',
          activeVisitor
        };
      }

      // Get visitor history
      const { data: visitorHistory } = await supabase
        .from('visitors')
        .select('*')
        .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
        .order('check_in_time', { ascending: false })
        .limit(1);

      return visitorHistory?.length > 0
        ? { ...visitorHistory[0], isNewVisitor: false }
        : { isNewVisitor: true };

    } catch (error) {
      console.error('Visitor search error:', error);
      throw error;
    }
  },

  // Get available visitor cards
  async getAvailableCards(departmentId) {
    try {
      const allCards = generateDepartmentCards(departmentId);
      const { data: inUseCards } = await supabase
        .from('visitors')
        .select('visitor_card')
        .eq('department', departmentId)
        .is('check_out_time', null);

      const inUseCardSet = new Set(inUseCards?.map(v => v.visitor_card) || []);
      return allCards.filter(card => !inUseCardSet.has(card));
    } catch (error) {
      console.error('Error getting available cards:', error);
      throw error;
    }
  },

  // Get used cards
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

  // Check in visitor
  async checkInVisitor(visitorData, username) {
    try {
      // Verify card availability
      const availableCards = await this.getAvailableCards(visitorData.department);
      if (!availableCards.includes(visitorData.visitorCard)) {
        throw new Error('Selected visitor card is no longer available');
      }

      let photoUrl = null;
      if (visitorData.photoUrl) {
        photoUrl = await this.uploadPhoto(visitorData.photoUrl);
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
  }
};

export default visitorService;
