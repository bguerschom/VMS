import { supabase } from '../config/supabase';
import { mockIdApi } from './mockApi';
import { generateDepartmentCards } from '../utils/constants';

export const visitorService = {
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
      console.log('Checking for active check-in...');
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

      // Search in mock API
      console.log('Searching in mock API...');
      const apiResponse = await mockIdApi.searchPerson(searchTerm);
      console.log('Mock API Response:', apiResponse);

      if (apiResponse.success) {
        console.log('Mock API found the visitor');

        // Get visitor history
        console.log('Fetching visitor history...');
        const { data: visitorHistory, error: historyError } = await supabase
          .from('visitors')
          .select('*')
          .or(`identity_number.eq.${searchTerm},phone_number.eq.${searchTerm}`)
          .order('check_in_time', { ascending: false })
          .limit(1);

        if (historyError) {
          console.log('History fetch error:', historyError);
        }

        console.log('Visitor history:', visitorHistory);

        const result = {
          ...apiResponse.data,
          isNewVisitor: !visitorHistory?.length,
          lastVisit: visitorHistory?.[0]
        };

        console.log('Returning result:', result);
        return result;
      }

      console.log('No visitor found in mock API');
      return null;
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

  // Create new visitor check-in
  async checkInVisitor(visitorData, username) {
    try {
      // Verify card is still available
      const availableCards = await this.getAvailableCards(visitorData.department);
      if (!availableCards.includes(visitorData.visitorCard)) {
        throw new Error('Selected visitor card is no longer available');
      }

      // If it's a passport visitor or new visitor, get a fresh photo URL
      let photoUrl = null;
      if (!visitorData.isPassport && visitorData.identityNumber) {
        photoUrl = await mockIdApi.getPhoto(visitorData.identityNumber);
      }

      const checkInData = {
        full_name: visitorData.fullName,
        identity_number: visitorData.identityNumber,
        gender: visitorData.gender,
        phone_number: visitorData.phoneNumber,
        nationality: visitorData.isPassport ? visitorData.nationality : null,
        visitor_card: visitorData.visitorCard,
        department: visitorData.department,
        purpose: visitorData.purpose,
        items: visitorData.items || null,
        laptop_brand: visitorData.laptopBrand || null,
        laptop_serial: visitorData.laptopSerial || null,
        check_in_by: username,
        has_laptop: !!visitorData.laptopBrand,
        is_passport: visitorData.isPassport || false
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
