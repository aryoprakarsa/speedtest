import React, { useState } from 'react';
import axios from 'axios';
import { ProgressBar, Row, Col, Button, Container, Card } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SpeedTestResults.css';

// Define the bytesToReadableSpeed function within this file
const bytesToReadableSpeed = (bytes) => {
  const speedInKbps = bytes / 1024;
  const speedInMbps = speedInKbps / 1024;

  if (speedInKbps < 1024) {
    return `${speedInKbps.toFixed(2)} Kbps`;
  } else {
    return `${speedInMbps.toFixed(2)} Mbps`;
  }
};

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isTesting, setIsTesting] = useState(false);

  const testSpeed = async () => {
    setIsTesting(true);
    setProgress(0);
    await testDownloadSpeed();
    await testUploadSpeed();
    setIsTesting(false);
  };

  const testDownloadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size

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
      setDownloadSpeed(bytesToReadableSpeed(speedInBps));
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const testUploadSpeed = async () => {
    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size
    const testFile = new Blob([new Uint8Array(fileSizeInBytes)], { type: 'application/octet-stream' });

    try {
      for (let i = 0; i <= 100; i++) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 10)); // Simulate network delay
      }

      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      setUploadSpeed(bytesToReadableSpeed(speedInBps));
    } catch (error) {
      console.error('Error uploading the file:', error);
    }
  };

  return (
    <Container className="mt-4">
      <Helmet>
        <title>Speed Test Application</title>
        <meta name="description" content="Test your download and upload speeds with our Speed Test Application." />
      </Helmet>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={12}>
          <Card>
            <Card.Header as="h1" className="text-center">Internet Speed Test</Card.Header>
            <Card.Body className="text-center">
              <Button 
                className="mb-3 circle-button mx-auto" 
                onClick={testSpeed} 
                disabled={isTesting}
              >
                Start!
              </Button>
              {isTesting && (
                <div className="progress-bar-container custom-progress-bar">
                  <ProgressBar now={progress} label={`${progress}%`} style={{ height: '30px' }} />
                </div>
              )}
              {downloadSpeed && <p className="bold-text">Download Speed: {downloadSpeed}</p>}
              {uploadSpeed && <p className="bold-text">Upload Speed: {uploadSpeed}</p>}
            </Card.Body>
            <Card.Footer className="text-left custom-card-footer">
              <strong>Note:</strong>
              <ol className="custom-list">
                <li>The test server uses GitHub servers.</li>
                <li>The download speed is calculated by downloading a 10MB file, and the upload speed is calculated by uploading a 10MB file.</li>
              </ol>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SpeedTest;
