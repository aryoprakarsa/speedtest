import React, { useState } from 'react';
import axios from 'axios';

const DownloadTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);

  const testDownloadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 5000000; // Size of your test file in bytes

    try {
      await axios.get('https://drive.google.com/uc?export=download&id=1pGHOQ0lSlTPu51zwjeHmjw0G_CQmLnPc', { responseType: 'arraybuffer' });
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      const speedInMbps = speedInBps / 1000000;
      setDownloadSpeed(speedInMbps.toFixed(2));
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  return (
    <div>
      <button onClick={testDownloadSpeed}>Test Download Speed</button>
      {downloadSpeed && <p>Download Speed: {downloadSpeed} Mbps</p>}
    </div>
  );
};

export default DownloadTest;
