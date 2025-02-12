const MOCK_USERS = [
  {
    identityNumber: "1199000000000000",
    phoneNumber: "250788315218",
    fullName: "Bigirimana Guerschom",
    gender: "Male",
    photoUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    nationality: "Rwandan"
  },
  {
    identityNumber: "1199000000000001",
    phoneNumber: "250785700813",
    fullName: "Jane Smith",
    gender: "Female",
    photoUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    nationality: "Rwandan"
  }
];

export const mockIdApi = {
  searchPerson: async (searchTerm) => {
    try {
      // Handle passport case
      if (searchTerm === '#00') {
        return {
          success: true,
          data: null,
          isPassport: true
        };
      }

      // Clean the search term
      const cleanSearchTerm = searchTerm.toString().trim();

      const person = MOCK_USERS.find(user => 
        user.identityNumber === cleanSearchTerm || 
        user.phoneNumber === cleanSearchTerm
      );

      if (person) {
        return {
          success: true,
          data: { ...person },
          isPassport: false
        };
      }

      return {
        success: false,
        error: "Person not found"
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getPhoto: async (identityNumber) => {
    try {
      const person = MOCK_USERS.find(user => user.identityNumber === identityNumber);
      return person?.photoUrl || null;
    } catch (error) {
      console.error('Photo fetch error:', error);
      return null;
    }
  }
};
