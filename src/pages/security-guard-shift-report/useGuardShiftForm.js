import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

export const useGuardShiftForm = () => {
  const { user } = useAuth();
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
      const submissionData = {
        submitted_by: user?.username,
        location: formData.location,
        shift_type: formData.shiftType,
        shift_start_time: formData.shiftStartTime,
        shift_end_time: formData.shiftEndTime,
        team_members: formData.teamMembers,
        monitoring_location: formData.location,
        monitoring_enabled: true,
        remote_locations_checked: null, 
        cctv_status: formData.cctvStatus,
        cctv_issues: formData.cctvIssues,
        electricity_status: formData.electricityStatus,
        water_status: formData.waterStatus,
        office_status: formData.officeStatus,
        parking_status: formData.parkingStatus,
        incident_occurred: formData.incidentOccurred,
        incident_type: formData.incidentOccurred ? formData.incidentType : null,
        incident_time: formData.incidentOccurred ? formData.incidentTime : null,
        incident_location: formData.incidentOccurred ? formData.incidentLocation : null,
        incident_description: formData.incidentOccurred ? formData.incidentDescription : null,
        action_taken: formData.incidentOccurred ? formData.actionTaken : null,
        notes: formData.notes || null,
        created_at: new Date().toISOString()
      };

      const { error: submitError } = await supabase
        .from('guard_shift_reports')
        .insert([submissionData]);

      if (submitError) throw submitError;
      
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
