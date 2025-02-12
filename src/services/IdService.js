// src/services/IdService.js
const NATIONAL_ID_API_URL = process.env.REACT_APP_NATIONAL_ID_API_URL;
const API_KEY = process.env.REACT_APP_NATIONAL_ID_API_KEY;

export const nationalIdService = {
  async verifyPerson(idNumber) {
    try {
      const response = await fetch(`${NATIONAL_ID_API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idNumber })
      });

      if (!response.ok) {
        throw new Error('Failed to verify ID');
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          fullName: data.names,               // Adjust based on actual API response
          identityNumber: data.documentNumber,// Adjust based on actual API response
          gender: data.sex,                   // Adjust based on actual API response
          dateOfBirth: data.dateOfBirth,     // Adjust based on actual API response
          nationality: data.nationality,      // Adjust based on actual API response
          photoUrl: data.photoUrl            // Adjust based on actual API response
        }
      };
    } catch (error) {
      console.error('Error verifying ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getPhoto(idNumber) {
    try {
      const response = await fetch(`${NATIONAL_ID_API_URL}/photo/${idNumber}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photo');
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching photo:', error);
      return null;
    }
  }
};
