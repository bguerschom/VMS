import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle,
  XCircle, 
  Camera, 
  Shield, 
  Power,
  Users,
  FileClock
} from 'lucide-react';
import { useGuardShiftForm } from './useGuardShiftForm';

// Define location groups
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

const GuardShiftReport = () => {
  useRoleAccess('/GuardShiftReport');
  const { 
    formData, 
    loading, 
    toast,
    currentTime,
    selectedLocation,
    newTeamMember,
    setSelectedLocation,
    setNewTeamMember,
    setFormData,
    addTeamMember,
    removeTeamMember,
    handleSubmit
  } = useGuardShiftForm();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2 z-50 
              ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Security Shift Report
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Submit detailed report of your shift observations and any incidents
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FileClock className="w-4 h-4" />
                <span>{currentTime.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shift Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Shift Information
              </h2>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Shift</option>
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                </select>

                <input
                  type="datetime-local"
                  value={formData.shiftStartTime}
                  onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />

                <input
                  type="datetime-local"
                  value={formData.shiftEndTime}
                  onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </motion.div>

            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                <Users className="w-5 h-5 mr-2" />
                Security Team Members
              </h2>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Security ID"
                    value={newTeamMember.id}
                    onChange={(e) => setNewTeamMember({...newTeamMember, id: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Guard Name"
                    value={newTeamMember.name}
                    onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={addTeamMember}
                    disabled={!newTeamMember.id || !newTeamMember.name}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                             transition-colors duration-200 disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {formData.teamMembers.map((member, index) => (
                    <div 
                      key={`${member.id}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          ID: {member.id}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {member.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Remote CCTV Monitoring */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Remote CCTV Monitoring
              </h2>
              
              <div className="mt-4 space-y-6">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Monitoring Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setFormData({
                        ...formData,
                        remoteLocationsChecked: {}
                      });
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Select Location</option>
                    <option value="nyarutarama">Nyarutarama</option>
                    <option value="remera">Remera Innovation Hub</option>
                  </select>
                </div>

                {selectedLocation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LOCATION_GROUPS[selectedLocation].map(location => (
                      <div key={location.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{location.name}</span>
                          <select
                            value={formData.remoteLocationsChecked[location.name]?.status || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              remoteLocationsChecked: {
                                ...formData.remoteLocationsChecked,
                                [location.name]: {
                                  ...formData.remoteLocationsChecked[location.name],
                                  status: e.target.value
                                }
                              }
                            })}
                            className="px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          >
                            <option value="">Please select status</option>
                            <option value="normal">Normal</option>
                            <option value="issues">Issues</option>
                            <option value="offline">Offline</option>
                          </select>
                        </div>
                        
                        {formData.remoteLocationsChecked[location.name]?.status === 'issues' && (
                          <input
                            type="text"
                            placeholder="Enter notes about issues..."
                            value={formData.remoteLocationsChecked[location.name]?.notes || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              remoteLocationsChecked: {
                                ...formData.remoteLocationsChecked,
                                [location.name]: {
                                  ...formData.remoteLocationsChecked[location.name],
                                  notes: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-600
                                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                            required
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Utility Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Power className="w-5 h-5 mr-2" />
                Utility Status
              </h2>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Electricity Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Electricity Status
                  </label>
                  <select
                    value={formData.electricityStatus}
                    onChange={(e) => setFormData({ ...formData, electricityStatus: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Please select status</option>
                    <option value="normal">Normal</option>
                    <option value="issues">Issues Present</option>
                    <option value="outage">Power Outage</option>
                  </select>
                </div>

                {/* Water Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Water Status
                  </label>
                  <select
                    value={formData.waterStatus}
                    onChange={(e) => setFormData({ ...formData, waterStatus: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Please select status</option>
                    <option value="normal">Normal</option>
                    <option value="issues">Issues Present</option>
                    <option value="outage">No Water Supply</option>
                  </select>
                </div>

                {/* Office Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Office Status
                  </label>
                  <select
                    value={formData.officeStatus}
                    onChange={(e) => setFormData({ ...formData, officeStatus: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Please select status</option>
                    <option value="normal">Normal</option>
                    <option value="issues">Issues Present</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Parking Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parking Status
                  </label>
                  <select
                    value={formData.parkingStatus}
                    onChange={(e) => setFormData({ ...formData, parkingStatus: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Please select status</option>
                    <option value="normal">Normal</option>
                    <option value="issues">Issues Present</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              </div>
            </motion.div>

             {/* Incident Reporting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Incident Report
                </h2>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.incidentOccurred}
                    onChange={(e) => setFormData({ ...formData, incidentOccurred: e.target.checked })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Incident Occurred</span>
                </label>
              </div>

              {formData.incidentOccurred && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formData.incidentType}
                      onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                      required={formData.incidentOccurred}
                    >
                      <option value="">Select Incident Type</option>
                      <option value="security-breach">Security Breach</option>
                      <option value="theft">Theft</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="fire">Fire</option>
                      <option value="water-damage">Water Damage</option>
                      <option value="power-issue">Power Issue</option>
                      <option value="suspicious-activity">Suspicious Activity</option>
                      <option value="other">Other</option>
                    </select>

                    <input
                      type="datetime-local"
                      value={formData.incidentTime}
                      onChange={(e) => setFormData({ ...formData, incidentTime: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                      required={formData.incidentOccurred}
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Incident Location"
                    value={formData.incidentLocation}
                    onChange={(e) => setFormData({ ...formData, incidentLocation: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                    required={formData.incidentOccurred}
                  />

                  <textarea
                    placeholder="Detailed description of the incident..."
                    value={formData.incidentDescription}
                    onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                    required={formData.incidentOccurred}
                  />

                  <textarea
                    placeholder="Actions taken in response..."
                    value={formData.actionTaken}
                    onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                    required={formData.incidentOccurred}
                  />
                </div>
              )}
            </motion.div>

            {/* Notes Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes and Observations
              </h2>

              <div className="space-y-4">
                <textarea
                  placeholder="Enter general observations and pending tasks for next shift..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                           min-h-[200px]"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default GuardShiftReport;
