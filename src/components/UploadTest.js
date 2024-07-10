import React, { useState } from 'react';

const UploadTest = () => {
  const [uploadSpeed, setUploadSpeed] = useState(null);

  const testUploadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size
    const testFile = new Blob([new Uint8Array(fileSizeInBytes)], { type: 'application/octet-stream' });

    try {
      // Simulate file processing/upload
      // Here you can simulate a delay to mimic network conditions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate a 1 second delay

      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      const speedInMbps = speedInBps / 1000000;
      setUploadSpeed(speedInMbps.toFixed(2));
    } catch (error) {
      console.error('Error uploading the file:', error);
    }
  };

  return (
    <div>
      <button onClick={testUploadSpeed}>Test Upload Speed</button>
      {uploadSpeed && <p>Upload Speed: {uploadSpeed} Mbps</p>}
    </div>
  );
};

export default UploadTest;
