import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { visitorService } from '../services/visitorService';

const DocumentScanner = ({ onScan, onPhotoCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
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
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please make sure you have given camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const processImage = async (photoData) => {
    try {
      setIsProcessing(true);
      
      // Extract text from image
      const extractedText = await visitorService.extractTextFromImage(photoData);
      
      // Parse the extracted text
      const documentData = visitorService.parseDocumentText(extractedText);
      
      // Send back both photo and extracted data
      onScan({
        photoUrl: photoData,
        ...documentData
      });
      
      onPhotoCapture(photoData);
    } catch (error) {
      console.error('Error processing image:', error);
      // Still send the photo even if OCR fails
      onScan({
        photoUrl: photoData,
        fullName: '',
        identityNumber: '',
        gender: '',
        nationality: ''
      });
      onPhotoCapture(photoData);
    } finally {
      setIsProcessing(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the photo data
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop the camera
      stopCamera();

      // Process the image
      await processImage(photoData);
    }
  };

  return (
    <div className="relative w-full h-full">
      {!isCapturing ? (
        <button
          onClick={startCamera}
          className="w-full h-full bg-gray-100 dark:bg-gray-700 
                     flex items-center justify-center cursor-pointer
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition-colors duration-200"
        >
          <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </button>
      ) : (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <button
            onClick={capturePhoto}
            disabled={isProcessing}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2
                       px-4 py-2 bg-black dark:bg-white 
                       text-white dark:text-black rounded-lg
                       hover:bg-gray-800 dark:hover:bg-gray-200
                       text-sm disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Capture'}
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DocumentScanner;
