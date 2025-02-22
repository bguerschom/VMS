import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

export const useGuardShiftForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ id: '', name: '' });
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const LOCATION_GROUPS = {
    nyarutarama: [
      { id: 'loc1', name: 'Head Quaters - Nyarutarama' },
      { id: 'loc3', name: 'Kigali - Service Centers' },
      { id: 'loc4', name: 'Eastern - Service Centers' },
      { id: 'loc5', name: 'Gahengeri - Switch' },
      { id: 'loc6', name: 'Norther - Service Centers' },
      { id: 'loc7', name: 'Gicumbi - Switch' },
      { id: 'loc8', name: 'Southern - Service Centers' },
      { id: 'loc9', name: 'Nyanza - Switch' },
      { id: 'loc10', name: 'Western - Service Centers' },
      { id: 'loc11', name: 'Karongi - Switch' }
    ],
    remera: [
      { id: 'loc2', name: 'Remera Innovation HUB - Remera' }
    ]
  };
  
  const [formData, setFormData] = useState({
    location: '',
    shiftType: '',
    shiftStartTime: '',
    shiftEndTime: '',
    teamMembers: [],
    remoteLocationsChecked: {},
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
        teamMembers: [...formData.teamMembers, newTeamMember]
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
      // Prepare location data - ensure all locations have a status
      const locationGroup = selectedLocation && monitoringEnabled ? LOCATION_GROUPS[selectedLocation] : [];
      const locationStatuses = {};
      
      if (monitoringEnabled) {
        locationGroup.forEach(location => {
          locationStatuses[location.name] = {
            status: formData.remoteLocationsChecked[location.name]?.status || 'normal',
            notes: formData.remoteLocationsChecked[location.name]?.notes || ''
          };
        });
      }

      const submissionData = {
        submitted_by: user?.username,
        location: formData.location,
        shift_type: formData.shiftType,
        shift_start_time: formData.shiftStartTime,
        shift_end_time: formData.shiftEndTime,
        team_members: formData.teamMembers,
        monitoring_enabled: monitoringEnabled, // Added monitoring toggle state
        monitoring_location: monitoringEnabled ? selectedLocation : null,
        remote_locations_checked: monitoringEnabled ? locationStatuses : null,
        electricity_status: formData.electricityStatus || 'normal',
        water_status: formData.waterStatus || 'normal',
        office_status: formData.officeStatus || 'normal',
        parking_status: formData.parkingStatus || 'normal',
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
        remoteLocationsChecked: {},
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
      setSelectedLocation('');
      setMonitoringEnabled(true);
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
    selectedLocation,
    newTeamMember,
    monitoringEnabled,
    isConfirmDialogOpen,
    setSelectedLocation,
    setNewTeamMember,
    setFormData,
    setMonitoringEnabled,
    setIsConfirmDialogOpen,
    addTeamMember,
    removeTeamMember,
    initiateSubmit,
    confirmSubmit,
    cancelSubmit,
    LOCATION_GROUPS
  };
};
