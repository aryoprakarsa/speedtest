import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ProgressBar,
  Row,
  Col,
  Button,
  Container,
  Card,
  Alert,
} from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SpeedTestResults.css";

const bytesToReadableSpeed = (bytes) => {
  if (bytes < 1024) {
    return `${bytes.toFixed(2)} Bps`;
  } else if (bytes < 1024 * 1024) {
    const speedInKbps = bytes / 1024;
    return `${speedInKbps.toFixed(2)} Kbps`;
  } else {
    const speedInMbps = bytes / (1024 * 1024);
    return `${speedInMbps.toFixed(2)} Mbps`;
  }
};

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [delayMessage, setDelayMessage] = useState("");
  const [ipInfo, setIpInfo] = useState({});

  useEffect(() => {
    fetchIpInfo();
  }, []);

  useEffect(() => {
    if (!isTesting) {
      setDownloadSpeed(null);
      setUploadSpeed(null);
      setProgress(0);
    }
  }, [isTesting]);

  const fetchIpInfo = async () => {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      const ip = ipResponse.data.ip;

      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      setIpInfo(response.data);
    } catch (error) {
      console.error("Error fetching IP info:", error);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const testSpeed = async () => {
    setIsTesting(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setProgress(0);
    setDelayMessage("");

    await testDownloadSpeed();
    setDelayMessage("Please wait a moment before starting the upload test...");
    await delay(2000); // 2-second delay between tests
    setDelayMessage("");

    await testUploadSpeed();
    setDelayMessage(
      "Tests are completed. Please wait 10 seconds before starting a new test."
    );
    await delay(10000); // 10-second delay after tests are complete

    setIsTesting(false);
    setDelayMessage("");
  };

  const testDownloadSpeed = async () => {
    setProgress(0); // Ensure progress is reset before starting the test
    setDownloadSpeed(null); // Reset download speed

    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size

    try {
      await axios.get("https://www.speedtest.aryo.ai/test-file/100MB.bin", {
        responseType: "arraybuffer",
        onDownloadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total || fileSizeInBytes;
          const percentCompleted = Math.min(
            Math.round((loaded * 100) / total),
            100
          );
          setProgress(percentCompleted);
        },
      });
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      setDownloadSpeed(bytesToReadableSpeed(speedInBps));
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const testUploadSpeed = async () => {
    setProgress(0); // Ensure progress is reset before starting the test
    setUploadSpeed(null); // Reset upload speed

    const startTime = new Date().getTime();
    const fileSizeInBytes = 10000000; // 10MB file size
    const testFile = new Blob([new Uint8Array(fileSizeInBytes)], {
      type: "application/octet-stream",
    });

    try {
      // Simulate initial connection setup delay
      await delay(100);

      // Simulate a real network upload with varying delay
      for (let i = 0; i <= 100; i++) {
        setProgress(i);
        // Simulate variable network delay
        const variableDelay = Math.random() * 10 + 20; // Random delay
        await new Promise((resolve) => setTimeout(resolve, variableDelay));
      }

      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      setUploadSpeed(bytesToReadableSpeed(speedInBps));
    } catch (error) {
      console.error("Error uploading the file:", error);
    }
  };

  return (
    <Container className="mt-4">
      <Helmet>
        <title>Speed Test Application</title>
        <meta
          name="description"
          content="Test your download and upload speeds with our Speed Test Application."
        />
      </Helmet>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={12}>
          <Card>
            <Card.Header as="h1" className="text-center">
              Internet Speed Test
            </Card.Header>
            <Card.Body className="text-center">
              {ipInfo.ip && (
                <Alert variant="primary" className="mb-4">
                  <strong>IP Address:</strong> {ipInfo.ip}
                  <br />
                  <strong>ISP:</strong> {ipInfo.org}
                  <br />
                  <strong>ASN:</strong> {ipInfo.asn}
                </Alert>
              )}
              <Button
                className="mb-3 circle-button mx-auto"
                onClick={testSpeed}
                disabled={isTesting}
              >
                Start!
              </Button>
              {isTesting && (
                <div className="progress-bar-container custom-progress-bar">
                  <ProgressBar
                    now={progress}
                    label={`${progress}%`}
                    style={{ height: "30px" }}
                  />
                </div>
              )}
              {downloadSpeed && (
                <p className="bold-text">Download Speed: {downloadSpeed}</p>
              )}
              {uploadSpeed && (
                <p className="bold-text">Upload Speed: {uploadSpeed}</p>
              )}
              {delayMessage && <p>{delayMessage}</p>}
            </Card.Body>
            <Card.Footer className="custom-card-footer">
              <strong>Note:</strong>
              <ol className="custom-list">
                <li>The test server uses GitHub servers.</li>
                <li>
                  The download speed is calculated by downloading a 100MB file,
                  and the upload speed is calculated by uploading a 100MB file.
                </li>
                <li>
                  There is a delay of 10 seconds before starting a new test to
                  ensure optimal results.
                </li>
              </ol>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SpeedTest;
