import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock passport OCR service - in a real app, you would use a real OCR service API
const mockPassportOcr = async (imageData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real implementation, this would send the image to an OCR API
  // and return the extracted data. For now, we'll return mock data
  return {
    success: true,
    data: {
      fullName: 'John Smith',
      identityNumber: 'AB123456789',
      gender: 'Male',
      nationality: 'British'
    }
  };
};

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const initializeCamera = async () => {
    if (isInitializing) return;
    setIsInitializing(true);
    setError(null);

    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      // First, check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Set a timeout for camera initialization
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Camera access timed out')), 10000);
      });

      // Try to get camera access with timeout
      const mediaStream = await Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        timeoutPromise
      ]);

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve).catch(resolve);
          };
        });
      }

      setIsInitializing(false);
    } catch (err) {
      console.error('Camera initialization error:', err);
      let errorMessage = 'Failed to access camera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera access was denied. Please grant camera permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please make sure your device has a camera.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is in use by another application.';
      } else if (err.message.includes('timed out')) {
        errorMessage = 'Camera access timed out. Please try again.';
      }

      setError(errorMessage);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setError(null);
    setIsInitializing(false);
    setCapturedImage(null);
    setExtractedData(null);
    onClose();
  };

  const retryCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setError(null);
    setCapturedImage(null);
    setExtractedData(null);
    initializeCamera();
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL('image/jpeg', 1.0);
      setCapturedImage(photoData);
      
      // Process the passport image with OCR
      setIsProcessing(true);
      const ocrResult = await mockPassportOcr(photoData);
      
      if (ocrResult.success) {
        setExtractedData(ocrResult.data);
      } else {
        setError('Failed to extract passport data. Please try again with a clearer image.');
      }
    } catch (err) {
      console.error('Photo capture error:', err);
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndSubmit = () => {
    if (!capturedImage || !extractedData) return;
    
    onCapture({
      photoUrl: capturedImage,
      ...extractedData
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
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X size={20} />
            </button>

            {/* Camera view or error state */}
            <div className="relative aspect-[4/3]">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <p className="text-red-500 text-center mb-4">{error}</p>
                  <button
                    onClick={retryCamera}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Retry Camera Access
                  </button>
                </div>
              ) : capturedImage ? (
                // Display captured passport image with extracted data
                <div className="absolute inset-0 flex flex-col">
                  <div className="relative flex-1">
                    <img 
                      src={capturedImage} 
                      alt="Captured passport" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-black dark:border-white border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm">Extracting passport data...</p>
                      </div>
                    </div>
                  ) : extractedData ? (
                    <div className="p-4 bg-gray-100 dark:bg-gray-700">
                      <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Extracted Data</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">Name: <span className="font-medium text-gray-900 dark:text-white">{extractedData.fullName}</span></p>
                        <p className="text-gray-600 dark:text-gray-300">ID: <span className="font-medium text-gray-900 dark:text-white">{extractedData.identityNumber}</span></p>
                        <p className="text-gray-600 dark:text-gray-300">Gender: <span className="font-medium text-gray-900 dark:text-white">{extractedData.gender}</span></p>
                        <p className="text-gray-600 dark:text-gray-300">Nationality: <span className="font-medium text-gray-900 dark:text-white">{extractedData.nationality}</span></p>
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button
                          onClick={() => {
                            setCapturedImage(null);
                            setExtractedData(null);
                          }}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          Retake
                        </button>
                        <button
                          onClick={confirmAndSubmit}
                          className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
                        >
                          Confirm & Use
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {isInitializing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Passport alignment guide */}
                      <div className="border-2 border-white border-dashed rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                        <p className="text-white text-shadow text-sm">Align passport here</p>
                      </div>
                      
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <button
                          onClick={capturePhoto}
                          disabled={isProcessing}
                          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Capture Passport
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraModal;
