import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle,
  XCircle, 
  Camera, 
  Shield, 
  Power,
  Users,
  FileClock,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useGuardShiftForm } from './useGuardShiftForm';

const GuardShiftReport = () => {
  const { 
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
  } = useGuardShiftForm();

  const renderConfirmationContent = () => {
    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <h3 className="font-medium text-gray-900 dark:text-white">Shift Information</h3>
        <div className="pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p>Location: {formData.location}</p>
          <p>Shift Type: {formData.shiftType}</p>
          <p>Start Time: {new Date(formData.shiftStartTime).toLocaleString()}</p>
          <p>End Time: {new Date(formData.shiftEndTime).toLocaleString()}</p>
        </div>

        <h3 className="font-medium text-gray-900 dark:text-white">Team Members</h3>
        <div className="pl-4">
          {formData.teamMembers.map((member, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
              {member.name} (ID: {member.id})
            </p>
          ))}
        </div>

        {monitoringEnabled && (
          <>
            <h3 className="font-medium text-gray-900 dark:text-white">CCTV Monitoring</h3>
            <div className="pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>Status: {formData.cctvStatus}</p>
              {formData.cctvIssues && <p>Issues: {formData.cctvIssues}</p>}
            </div>
          </>
        )}

        <h3 className="font-medium text-gray-900 dark:text-white">Utility Status</h3>
        <div className="pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p>Electricity: {formData.electricityNotes || 'No issues'}</p>
          <p>Water: {formData.waterNotes || 'No issues'}</p>
          <p>Office: {formData.officeNotes || 'No issues'}</p>
          <p>Parking: {formData.parkingNotes || 'No issues'}</p>
        </div>

        {formData.incidentOccurred && (
          <>
            <h3 className="font-medium text-gray-900 dark:text-white">Incident Details</h3>
            <div className="pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <p>Type: {formData.incidentType}</p>
              <p>Time: {formData.incidentTime}</p>
              <p>Location: {formData.incidentLocation}</p>
              <p>Description: {formData.incidentDescription}</p>
              <p>Action Taken: {formData.actionTaken}</p>
            </div>
          </>
        )}

        {formData.notes && (
          <>
            <h3 className="font-medium text-gray-900 dark:text-white">Additional Notes</h3>
            <p className="pl-4 text-sm text-gray-600 dark:text-gray-300">{formData.notes}</p>
          </>
        )}
      </div>
    );
  };

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

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Report Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the following information before submitting:
              {renderConfirmationContent()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSubmit}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Confirm Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  Guard Shift Form
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

          <form onSubmit={initiateSubmit} className="space-y-6">
            {/* Shift Information (unchanged) */}
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
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                           dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  required
                >
                  <option value="">Select Location</option>
                  <option value="nyarutarama">Nyarutarama</option>
                  <option value="remera">Remera Switch</option>
                </select>

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
                    value={formData.newTeamMemberId || ''}
                    onChange={(e) => setFormData({...formData, newTeamMemberId: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="Guard Name"
                    value={formData.newTeamMemberName || ''}
                    onChange={(e) => setFormData({...formData, newTeamMemberName: e.target.value})}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={addTeamMember}
                    disabled={!formData.newTeamMemberId || !formData.newTeamMemberName}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  CCTV Monitoring
                </h2>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={monitoringEnabled}
                    onChange={(e) => setMonitoringEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable CCTV Check</span>
                </label>
              </div>
              
              {monitoringEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CCTV Working Status
                    </label>
                    <select
                      value={formData.cctvStatus}
                      onChange={(e) => setFormData({ ...formData, cctvStatus: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                               dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                      required={monitoringEnabled}
                    >
                      <option value="">Select CCTV Status</option>
                      <option value="fully-functional">Fully Functional</option>
                      <option value="partial-issue">Partial Issue</option>
                      <option value="not-working">Not Working</option>
                    </select>
                  </div>

                  {(formData.cctvStatus === 'partial-issue' || formData.cctvStatus === 'not-working') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Describe CCTV Issues
                      </label>
                      <textarea
                        value={formData.cctvIssues}
                        onChange={(e) => setFormData({ ...formData, cctvIssues: e.target.value })}
                        placeholder="Provide details about CCTV issues..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                                 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                                 min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
              )}
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
                {/* Electricity Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Electricity Notes
                  </label>
                  <textarea
                    value={formData.electricityNotes}
                    onChange={(e) => setFormData({ ...formData, electricityNotes: e.target.value })}
                    placeholder="Any electricity-related observations..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                  />
                </div>

                {/* Water Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Water Notes
                  </label>
                  <textarea
                    value={formData.waterNotes}
                    onChange={(e) => setFormData({ ...formData, waterNotes: e.target.value })}
                    placeholder="Any water-related observations..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                  />
                </div>

                {/* Office Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Office Notes
                  </label>
                  <textarea
                    value={formData.officeNotes}
                    onChange={(e) => setFormData({ ...formData, officeNotes: e.target.value })}
                    placeholder="Any office-related observations..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                  />
                </div>

                {/* Parking Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parking Notes
                  </label>
                  <textarea
                    value={formData.parkingNotes}
                    onChange={(e) => setFormData({ ...formData, parkingNotes: e.target.value })}
                    placeholder="Any parking-related observations..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                             dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-black
                             min-h-[100px]"
                  />
                </div>
              </div>
            </motion.div>

            {/* Rest of the component remains the same as in the previous version */}
            {/* Incident Reporting Section */}
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
                  {/* Incident details section (unchanged) */}
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
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default GuardShiftReport;
