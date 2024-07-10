import React, { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import './SpeedTestResults.css';

// Add formatSpeed function here
const formatSpeed = (speedInBps) => {
  const speedInKbps = speedInBps / 1000;
  const speedInMbps = speedInKbps / 1000;

  if (speedInKbps < 1000) {
    return `${speedInKbps.toFixed(2)} Kbps`;
  } else {
    return `${speedInMbps.toFixed(2)} Mbps`;
  }
};

const UploadTest = () => {
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const testUploadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size
    const testFile = new Blob([new Uint8Array(fileSizeInBytes)], { type: 'application/octet-stream' });
    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate file processing/upload
      for (let i = 0; i <= 100; i++) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate network delay
      }
      
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      setUploadSpeed(formatSpeed(speedInBps));
    } catch (error) {
      console.error('Error uploading the file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <button 
        className="btn btn-primary mb-3" 
        onClick={testUploadSpeed} 
        disabled={isUploading}
      >
        Test Upload Speed
      </button>
      {isUploading && (
        <div className="progress-bar-container custom-progress-bar">
          <ProgressBar now={progress} label={`${progress}%`} style={{ height: '30px' }} />
        </div>
      )}
      {uploadSpeed && <p className="bold-text">Upload Speed: {uploadSpeed}</p>}
    </div>
  );
};

export default UploadTest;
