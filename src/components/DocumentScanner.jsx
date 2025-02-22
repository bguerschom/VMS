import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const DocumentScanner = ({ onScan, onPhotoCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Cleanup function for camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start camera with proper video initialization
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
        // Wait for video to be ready
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

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera after capture
      stopCamera();

      // Send the photo data back
      onPhotoCapture(photoData);
      
      // For now, just send dummy data for demonstration
      // In production, you would integrate with actual OCR service
      onScan({
        photoUrl: photoData,
        fullName: '',
        identityNumber: '',
        gender: '',
        nationality: ''
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      {!isCapturing ? (
        <button
          onClick={startCamera}
          className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 
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
            className="w-full h-full rounded-full object-cover"
          />
          <button
            onClick={capturePhoto}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2
                       px-4 py-2 bg-black dark:bg-white 
                       text-white dark:text-black rounded-lg
                       hover:bg-gray-800 dark:hover:bg-gray-200
                       text-sm"
          >
            Capture
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DocumentScanner;
