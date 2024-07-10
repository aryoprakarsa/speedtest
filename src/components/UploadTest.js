import React, { useState } from 'react';
import axios from 'axios';

const UploadTest = () => {
  const [uploadSpeed, setUploadSpeed] = useState(null);

  const testUploadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size
    const testFile = new Blob([new Uint8Array(fileSizeInBytes)], { type: 'application/octet-stream' });

    const formData = new FormData();
    formData.append('file', testFile, 'testfile.dat');

    try {
      await axios.post('https://cors-anywhere.herokuapp.com/YOUR_UPLOAD_ENDPOINT_URL', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
