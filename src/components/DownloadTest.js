import React, { useState } from 'react';
import axios from 'axios';
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

const DownloadTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const testDownloadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size
    setIsDownloading(true);
    setProgress(0);

    try {
      await axios.get('https://www.speedtest.aryo.ai/test-file/10MB.bin', {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / fileSizeInBytes);
          setProgress(percentCompleted);
        }
      });
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      setDownloadSpeed(formatSpeed(speedInBps));
    } catch (error) {
      console.error('Error downloading the file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <button 
        className="btn btn-primary mb-3" 
        onClick={testDownloadSpeed} 
        disabled={isDownloading}
      >
        Test Download Speed
      </button>
      {isDownloading && (
        <div className="progress-bar-container custom-progress-bar">
          <ProgressBar now={progress} label={`${progress}%`} style={{ height: '30px' }} />
        </div>
      )}
      {downloadSpeed && <p className="bold-text">Download Speed: {downloadSpeed}</p>}
    </div>
  );
};

export default DownloadTest;
