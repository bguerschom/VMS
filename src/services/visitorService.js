import { createWorker } from 'tesseract.js';
import { supabase } from '../config/supabase';
import { mockIdApi } from './mockApi';
import { generateDepartmentCards } from '../utils/constants';

export const visitorService = {
  // Extract text from captured image using Tesseract OCR
// Update these functions in your visitorService.js

extractTextFromImage: async (imageData, enhancedMode = false) => {
  const worker = await createWorker({
    logger: progress => console.log('OCR Progress:', progress)
  });

  try {
    console.log('Starting OCR process...');
    
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Configure specific settings for ID card text detection
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/abcdefghijklmnopqrstuvwxyz ',
      tessedit_ocr_engine_mode: '2', // Use Legacy + LSTM mode
      tessedit_pageseg_mode: '6', // Assume uniform text block
      textord_min_linesize: '2.5', // Adjust for small text
      tessedit_do_invert: '0'
    });

    // First try with normal settings
    let { data } = await worker.recognize(imageData);
    
    // If text seems incomplete, try with different settings
    if (!data.text.toLowerCase().includes('names') || !data.text.includes('ID No')) {
      await worker.setParameters({
        tessedit_ocr_engine_mode: '3', // Use only LSTM
        scale_factor: '1.5', // Increase image scale
        textord_min_linesize: '2.0'
      });
      const result = await worker.recognize(imageData);
      data = result.data;
    }

    console.log('Extracted text:', data.text);
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

parseDocumentText: (text) => {
  try {
    console.log('Starting text parsing:', text);
    
    const data = {
      fullName: '',
      identityNumber: '',
      gender: '',
      nationality: 'Rwandan'
    };

    // Split into lines and clean up
    const lines = text.split('\n').map(line => {
      return line.trim().replace(/\s+/g, ' ');
    });

    console.log('Processing lines:', lines);

    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      const nextLine = lines[i + 1] ? lines[i + 1].toLowerCase() : '';

      // Name detection - specific to Rwanda ID format
      if (line.includes('amazina') || line.includes('names')) {
        // Look for name in the next line if it exists and doesn't contain other fields
        if (nextLine && !nextLine.includes('birth') && !nextLine.includes('sex')) {
          data.fullName = nextLine;
        } else {
          // Try to extract name from the current line
          const nameParts = lines[i].split(/[/:]/).map(part => part.trim());
          if (nameParts.length > 1) {
            data.fullName = nameParts[nameParts.length - 1];
          }
        }
      }

      // ID Number detection - looking for the specific Rwanda ID format
      if (line.includes('national id no') || line.includes('indangamuntu')) {
        // Look for the ID pattern: 1 YYYY X XXXXXXX X XX
        const idPattern = /1\s*\d{4}\s*\d\s*\d{7}\s*\d\s*\d{2}/;
        const idMatch = line.match(idPattern) || nextLine.match(idPattern);
        if (idMatch) {
          data.identityNumber = idMatch[0].replace(/\s/g, '');
        }
      }

      // Gender detection - specific to Rwanda ID format
      if (line.includes('sex') || line.includes('igitsina')) {
        // Look for Gabo/M or Gore/F pattern
        if (line.includes('gabo') || line.includes('/ m')) {
          data.gender = 'Male';
        } else if (line.includes('gore') || line.includes('/ f')) {
          data.gender = 'Female';
        }
      }
    }

    // Clean up the extracted data
    if (data.fullName) {
      data.fullName = data.fullName
        .replace(/amazina|names|[/:]/gi, '')
        .trim()
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    // Validate the extracted data
    const isValid = data.fullName && data.identityNumber && data.gender;
    if (!isValid) {
      console.log('Validation failed:', data);
      throw new Error('Could not extract all required fields');
    }

    console.log('Successfully parsed data:', data);
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
