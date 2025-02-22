import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { visitorService } from '../services/visitorService';

const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let mediaStream = null;

    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
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

    if (isOpen) {
      startCamera();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onClose();
  };

  const processImage = async (photoData) => {
    try {
      setIsProcessing(true);
      const extractedText = await visitorService.extractTextFromImage(photoData);
      const documentData = visitorService.parseDocumentText(extractedText);
      
      onCapture({
        photoUrl: photoData,
        ...documentData
      });
    } catch (error) {
      console.error('Error processing image:', error);
      onCapture({
        photoUrl: photoData,
        fullName: '',
        identityNumber: '',
        gender: '',
        nationality: ''
      });
    } finally {
      setIsProcessing(false);
      handleClose();
    }
  };
  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set high resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Apply image processing for better OCR
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Increase contrast and sharpness
      context.filter = 'contrast(1.2) brightness(1.1)';
      context.drawImage(canvas, 0, 0);
      context.filter = 'none';

      // Convert to high-quality JPEG
      const photoData = canvas.toDataURL('image/jpeg', 1.0);

      console.log('Capturing photo...');
      setIsProcessing(true);

      try {
        const extractedText = await visitorService.extractTextFromImage(photoData);
        console.log('Extracted text:', extractedText);
        
        const documentData = visitorService.parseDocumentText(extractedText);
        console.log('Parsed data:', documentData);

        // Only close and send data if we got some results
        if (documentData.fullName || documentData.identityNumber) {
          onCapture({
            photoUrl: photoData,
            ...documentData
          });
          handleClose();
        } else {
          alert('Could not read the document clearly. Please try again with better lighting and make sure the document is clearly visible.');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing the image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
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

            {/* Camera view */}
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black 
                           rounded-lg shadow-lg hover:bg-opacity-90 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Capture Photo'}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              <p>Position the ID/Passport in the frame and ensure good lighting</p>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CameraModal;
