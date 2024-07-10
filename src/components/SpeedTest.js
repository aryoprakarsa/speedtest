import React from 'react';
import { Helmet } from 'react-helmet';
import DownloadTest from './DownloadTest';
import UploadTest from './UploadTest';

const SpeedTest = () => {
  return (
    <div>
      <Helmet>
        <title>Speed Test App</title>
        <meta name="description" content="Test your download and upload speeds with our Speed Test Application." />
      </Helmet>
      <h1>Speed Test</h1>
      <DownloadTest />
      <UploadTest />
    </div>
  );
};

export default SpeedTest;
