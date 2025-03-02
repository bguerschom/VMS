import { useState, useEffect } from 'react';

export const useGuardShiftForm = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newTeamMember, setNewTeamMember] = useState({ id: '', name: '' });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    location: '',
    shiftType: '',
    shiftStartTime: '',
    shiftEndTime: '',
    teamMembers: [],
    cctvStatus: '',
    cctvIssues: '',
    electricityStatus: '',
    waterStatus: '',
    officeStatus: '',
    parkingStatus: '',
    incidentOccurred: false,
    incidentType: '',
    incidentTime: '',
    incidentLocation: '',
    incidentDescription: '',
    actionTaken: '',
    notes: ''
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const addTeamMember = () => {
    if (newTeamMember.id && newTeamMember.name) {
      setFormData({
        ...formData,
        teamMembers: [...formData.teamMembers, { 
          id: newTeamMember.id, 
          name: newTeamMember.name 
        }]
      });
      setNewTeamMember({ id: '', name: '' });
    }
  };

  const removeTeamMember = (id) => {
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter(member => member.id !== id)
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Mock successful submission for now
      // In a real implementation, this is where you would send data to your API
      console.log('Form submitted with data:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('Report submitted successfully!', 'success');

      // Reset form
      setFormData({
        location: '',
        shiftType: '',
        shiftStartTime: '',
        shiftEndTime: '',
        teamMembers: [],
        cctvStatus: '',
        cctvIssues: '',
        electricityStatus: '',
        waterStatus: '',
        officeStatus: '',
        parkingStatus: '',
        incidentOccurred: false,
        incidentType: '',
        incidentTime: '',
        incidentLocation: '',
        incidentDescription: '',
        actionTaken: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setLoading(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const initiateSubmit = (e) => {
    e.preventDefault();
    setIsConfirmDialogOpen(true);
  };

  const confirmSubmit = () => {
    handleSubmit();
  };

  const cancelSubmit = () => {
    setIsConfirmDialogOpen(false);
  };

  return {
    formData,
    loading,
    toast,
    currentTime,
    newTeamMember,
    isConfirmDialogOpen,
    setFormData,
    setNewTeamMember,
    setIsConfirmDialogOpen,
    addTeamMember,
    removeTeamMember,
    initiateSubmit,
    confirmSubmit,
    cancelSubmit
  };
};
