import React, { useState } from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';

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
      const speedInMbps = speedInBps / 1000000;
      setDownloadSpeed(speedInMbps.toFixed(2));
    } catch (error) {
      console.error('Error downloading the file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <button onClick={testDownloadSpeed} disabled={isDownloading}>Test Download Speed</button>
      {isDownloading && (
        <div>
          <ProgressBar now={progress} label={`${progress}%`} />
        </div>
      )}
      {downloadSpeed && <p>Download Speed: {downloadSpeed} Mbps</p>}
    </div>
  );
};

export default DownloadTest;
