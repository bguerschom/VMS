.value })}
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
