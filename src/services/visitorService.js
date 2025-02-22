import { createWorker } from 'tesseract.js';
import { supabase } from '../config/supabase';
import { mockIdApi } from './mockApi';
import { generateDepartmentCards } from '../utils/constants';

export const visitorService = {
  // Extract text from captured image using Tesseract OCR
  extractTextFromImage: async (imageData, enhancedMode = false) => {
    const worker = await createWorker({
      logger: progress => console.log('OCR Progress:', progress)
    });

    try {
      console.log('Starting OCR process...');
      
      // Load language data
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      // Set specific configurations for ID card recognition
      if (enhancedMode) {
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/abcdefghijklmnopqrstuvwxyz ',
          tessedit_pageseg_mode: '6', // Assume uniform text block
          preserve_interword_spaces: '1',
          tessedit_do_invert: '0',
        });
      }
      
      console.log('Worker initialized, starting recognition...');

      // Recognize text
      const { data } = await worker.recognize(imageData);
      console.log('Text recognized:', data.text);

      // Cleanup
      await worker.terminate();
      
      return data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      if (worker) {
        await worker.terminate();
      }
      throw new Error('Failed to extract text from image');
    }
  },

  // Parse Rwandan ID/Passport text
  parseDocumentText: (text) => {
    try {
      console.log('Starting text parsing:', text);
      
      const data = {
        fullName: '',
        identityNumber: '',
        gender: '',
        nationality: 'Rwandan'
      };

      // Split text into lines and normalize
      const lines = text.split('\n').map(line => line.trim());
      
      // First pass: Look for exact matches
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        
        // Name detection
        if (lowerLine.includes('amazina') || lowerLine.includes('names')) {
          // Check next line for the actual name
          if (lines[index + 1] && !lines[index + 1].toLowerCase().includes('national')) {
            data.fullName = lines[index + 1].trim();
          } else {
            // Try to extract name from the same line
            const afterNames = line.split(/amazina|names/i)[1];
            if (afterNames) {
              data.fullName = afterNames.replace(/[/:]/g, '').trim();
            }
          }
        }

        // ID number detection
        if (lowerLine.includes('national id no') || lowerLine.includes('indangamuntu')) {
          // Look for number pattern: 1 XXXX X XXXXXXX X XX
          const idMatch = line.match(/\d[\s\d]+\d/);
          if (idMatch) {
            data.identityNumber = idMatch[0].replace(/\s/g, '');
          } else if (lines[index + 1]) {
            // Check next line for ID number
            const nextLineMatch = lines[index + 1].match(/\d[\s\d]+\d/);
            if (nextLineMatch) {
              data.identityNumber = nextLineMatch[0].replace(/\s/g, '');
            }
          }
        }

        // Gender detection
        if (lowerLine.includes('sex') || lowerLine.includes('igitsina')) {
          if (lowerLine.includes('gabo') || lowerLine.includes('/ m')) {
            data.gender = 'Male';
          } else if (lowerLine.includes('gore') || lowerLine.includes('/ f')) {
            data.gender = 'Female';
          }
        }
      });

      // Second pass: If still missing data, try alternative methods
      if (!data.fullName || !data.identityNumber || !data.gender) {
        console.log('Missing data, trying alternative extraction methods...');

        // Alternative name detection
        if (!data.fullName) {
          // Look for lines with all caps or proper case words
          const possibleNames = lines.filter(line => 
            /^[A-Z\s]+$/.test(line) || /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)
          );
          if (possibleNames.length > 0) {
            data.fullName = possibleNames[0].trim();
          }
        }

        // Alternative ID detection
        if (!data.identityNumber) {
          // Look for any 16-digit number in the text
          const fullText = text.replace(/\s/g, '');
          const idMatch = fullText.match(/\d{16}/);
          if (idMatch) {
            data.identityNumber = idMatch[0];
          }
        }

        // Alternative gender detection
        if (!data.gender) {
          const fullText = text.toLowerCase();
          if (fullText.includes('male') || fullText.includes('gabo')) {
            data.gender = 'Male';
          } else if (fullText.includes('female') || fullText.includes('gore')) {
            data.gender = 'Female';
          }
        }
      }

      // Clean up and validate the results
      if (data.fullName) {
        data.fullName = data.fullName
          .replace(/Amazina|Names|\/|:/gi, '')
          .trim()
          .toUpperCase();
      }

      if (data.identityNumber) {
        data.identityNumber = data.identityNumber
          .replace(/[^\d]/g, '')
          .substring(0, 16); // Ensure exactly 16 digits
      }

      console.log('Final parsed data:', data);
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

  // Search for a visitor
  searchVisitor: async (searchTerm) => {
    try {
      console.log('Search initiated with term:', searchTerm);

      // Handle passport case
      if (searchTerm === '#00') {
        console.log('Passport case detected');
        return { isPassport: true };
      }

      // First check if visitor is already checked in
      const { data: activeVisitor, error: activeError } = await supabase
        .from('visitors')
        .select('*')
        .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
        .is('check_out_time', null)
        .single();

      if (activeError) {
        console.log('Active visitor query error:', activeError);
      }

      if (activeVisitor) {
        console.log('Found active visitor:', activeVisitor);
        return {
          error: 'Visitor already has an active check-in',
          activeVisitor
        };
      }

      // Get visitor history
      const { data: visitorHistory, error: historyError } = await supabase
        .from('visitors')
        .select('*')
        .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
        .order('check_in_time', { ascending: false })
        .limit(1);

      if (historyError) {
        console.log('History fetch error:', historyError);
      }

      if (visitorHistory?.length > 0) {
        return {
          ...visitorHistory[0],
          isNewVisitor: false
        };
      }

      return { isNewVisitor: true };
    } catch (error) {
      console.error('Visitor search error:', error);
      throw new Error(`Search failed: ${error.message}`);
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

  // Check in visitor
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
