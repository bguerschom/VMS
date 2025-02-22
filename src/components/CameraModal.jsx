import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [manualData, setManualData] = useState({
    fullName: '',
    identityNumber: '',
    gender: 'Male'  // Default to Male since most IDs show "Gabo/M"
  });
  const [step, setStep] = useState('capture'); // capture, verify
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let mediaStream = null;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 3840 }, // 4K resolution
            height: { ideal: 2160 }
          }
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              resolve();
            };
          });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Failed to access camera. Please make sure you have given camera permissions.');
      }
    };

    if (isOpen && step === 'capture') {
      startCamera();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, step]);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setStep('capture');
    setManualData({
      fullName: '',
      identityNumber: '',
      gender: 'Male'
    });
    onClose();
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoData = canvas.toDataURL('image/jpeg', 1.0);
      setCapturedImage(photoData);
      
      // Stop camera after capture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      setStep('verify');
    }
  };

  const handleVerification = () => {
    // Validate the data
    if (!manualData.fullName || !manualData.identityNumber) {
      alert('Please fill in both name and ID number');
      return;
    }

    if (!manualData.identityNumber.match(/^1\d{15}$/)) {
      alert('ID number should be 16 digits starting with 1');
      return;
    }

    onCapture({
      photoUrl: capturedImage,
      ...manualData
    });
    
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X size={20} />
            </button>

            {step === 'capture' ? (
              // Camera View
              <div className="relative aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black 
                             rounded-lg shadow-lg hover:bg-opacity-90"
                  >
                    Capture Photo
                  </button>
                </div>
              </div>
            ) : (
              // Verification View
              <div className="p-6 space-y-6">
                {/* Captured Image Preview */}
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Captured ID" 
                    className="w-full object-contain"
                  />
                </div>

                {/* Manual Data Entry */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name (as shown on ID)
                    </label>
                    <input
                      type="text"
                      value={manualData.fullName}
                      onChange={(e) => setManualData(prev => ({
                        ...prev,
                        fullName: e.target.value.toUpperCase()
                      }))}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g., BIGIRIMANA GUERSCHOM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID Number (16 digits)
                    </label>
                    <input
                      type="text"
                      value={manualData.identityNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setManualData(prev => ({
                          ...prev,
                          identityNumber: value
                        }));
                      }}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g., 1200080015331"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={manualData.gender}
                      onChange={(e) => setManualData(prev => ({
                        ...prev,
                        gender: e.target.value
                      }))}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="Male">Male (Gabo/M)</option>
                      <option value="Female">Female (Gore/F)</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setCapturedImage(null);
                      setStep('capture');
                    }}
                    className="px-6 py-2 border rounded-lg text-gray-700 dark:text-white 
                             hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Retake Photo
                  </button>
                  <button
                    onClick={handleVerification}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black 
                             rounded-lg shadow-lg hover:bg-opacity-90 flex items-center space-x-2"
                  >
                    <Check size={20} />
                    <span>Confirm & Save</span>
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraModal;
