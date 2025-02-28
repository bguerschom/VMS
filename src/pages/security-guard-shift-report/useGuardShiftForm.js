import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

export const useGuardShiftForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    location: '',
    shiftType: '',
    shiftStartTime: '',
    shiftEndTime: '',
    teamMembers: [],
    cctvStatus: '',
    cctvIssues: '',
    electricityNotes: '',
    waterNotes: '',
    officeNotes: '',
    parkingNotes: '',
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
    const newTeamMember = {
      id: formData.newTeamMemberId || '',
      name: formData.newTeamMemberName || ''
    };

    if (newTeamMember.id && newTeamMember.name) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newTeamMember],
        newTeamMemberId: '',
        newTeamMemberName: ''
      }));
    }
  };

  const removeTeamMember = (id) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== id)
    }));
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
        cctv_status: monitoringEnabled ? {
          is_working: formData.cctvStatus,
          issues: formData.cctvIssues
        } : null,
        electricity_notes: formData.electricityNotes || null,
        water_notes: formData.waterNotes || null,
        office_notes: formData.officeNotes || null,
        parking_notes: formData.parkingNotes || null,
        incident_occurred: formData.incidentOccurred,
        incident_type: formData.incidentType || null,
        incident_time: formData.incidentOccurred && formData.incidentTime ? formData.incidentTime : null,
        incident_location: formData.incidentLocation || null,
        incident_description: formData.incidentDescription || null,
        action_taken: formData.actionTaken || null,
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
        electricityNotes: '',
        waterNotes: '',
        officeNotes: '',
        parkingNotes: '',
        incidentOccurred: false,
        incidentType: '',
        incidentTime: '',
        incidentLocation: '',
        incidentDescription: '',
        actionTaken: '',
        notes: ''
      });
      setMonitoringEnabled(false);
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
    monitoringEnabled,
    isConfirmDialogOpen,
    setFormData,
    setMonitoringEnabled,
    setIsConfirmDialogOpen,
    addTeamMember,
    removeTeamMember,
    initiateSubmit,
    confirmSubmit,
    cancelSubmit
  };
};
