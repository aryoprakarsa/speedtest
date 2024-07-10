import React, { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

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
      const speedInMbps = speedInBps / 1000000;
      setUploadSpeed(speedInMbps.toFixed(2));
    } catch (error) {
      console.error('Error uploading the file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <button onClick={testUploadSpeed} disabled={isUploading}>Test Upload Speed</button>
      {isUploading && (
        <div>
          <ProgressBar now={progress} label={`${progress}%`} />
        </div>
      )}
      {uploadSpeed && <p>Upload Speed: {uploadSpeed} Mbps</p>}
    </div>
  );
};

export default UploadTest;
