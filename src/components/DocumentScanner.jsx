import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

const DocumentScanner = ({ onScan, onPhotoCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
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
      const photoData = canvas.toDataURL('image/jpeg');
      
      // Stop camera after capture
      stopCamera();

      // Process the image
      processImage(photoData);
    }
  };

  // Process captured image for text extraction
  const processImage = async (imageData) => {
    try {
      // Call your OCR service here
      const result = await extractTextFromImage(imageData);
      
      // Parse Rwandan ID format
      const parsedData = parseRwandanID(result);
      
      // Send back both the photo and extracted data
      onScan({
        photoUrl: imageData,
        ...parsedData
      });
      
      onPhotoCapture(imageData);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  // Parse Rwandan ID text
  const parseRwandanID = (text) => {
    // Example parsing logic - adjust based on actual Rwandan ID format
    const data = {
      fullName: '',
      identityNumber: '',
      gender: '',
      nationality: 'Rwandan' // Default for Rwandan IDs
    };

    // Add your specific Rwandan ID parsing logic here
    // This is a simplified example - you'll need to adjust based on actual format
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('names:')) {
        data.fullName = line.split('Names:')[1].trim();
      }
      if (line.toLowerCase().includes('no:')) {
        data.identityNumber = line.split('No:')[1].trim();
      }
      if (line.toLowerCase().includes('sex:')) {
        const sex = line.split('Sex:')[1].trim();
        data.gender = sex.startsWith('M') ? 'Male' : 'Female';
      }
    });

    return data;
  };

  return (
    <div className="relative">
      {!isCapturing ? (
        <button
          onClick={startCamera}
          className="w-40 h-40 rounded-full bg-gray-100 dark:bg-gray-700 
                     flex items-center justify-center cursor-pointer
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition-colors duration-200"
        >
          <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <button
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                       px-4 py-2 bg-black dark:bg-white 
                       text-white dark:text-black rounded-lg
                       hover:bg-gray-800 dark:hover:bg-gray-200"
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
