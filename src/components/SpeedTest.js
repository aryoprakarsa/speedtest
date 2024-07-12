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
  Spinner,
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
  const [ping, setPing] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [delayMessage, setDelayMessage] = useState("");
  const [ipInfo, setIpInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [renderTime, setRenderTime] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    fetchIpInfo().finally(() => {
      const endTime = performance.now();
      setRenderTime((endTime - startTime).toFixed(2));
    });
  }, []);

  const fetchIpInfo = async () => {
    try {
      const ipResponse = await axios.get("https://api.ipify.org?format=json");
      const ip = ipResponse.data.ip;

      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      setIpInfo(response.data);
    } catch (error) {
      console.error("Error fetching IP info:", error);
    } finally {
      setLoading(false);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const clearCache = () => {
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  };

  const testPing = async () => {
    const pingTimes = [];
    const pingDuration = 5000; // 5000 milliseconds
    const interval = 200; // Interval between pings
    const endTime = performance.now() + pingDuration;

    while (performance.now() < endTime) {
      const startTime = performance.now();
      try {
        await axios.get("https://www.speedtest.aryo.ai");
        const pingTime = performance.now() - startTime;
        pingTimes.push(pingTime);
      } catch (error) {
        console.error("Error pinging the server:", error);
      }
      await delay(interval);
    }

    if (pingTimes.length > 0) {
      const averagePing = pingTimes.reduce((a, b) => a + b) / pingTimes.length;
      setPing(averagePing.toFixed(2));
    } else {
      setPing(null);
    }
  };

  const testSpeed = async () => {
    setPing(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setProgress(0);
    setDelayMessage("");
    clearCache();
    setIsTesting(true);
    setShowResults(false);

    setStatusMessage("Testing ping...");
    await testPing();

    setStatusMessage("Testing download speed...");
    await testDownloadSpeed();
    setDelayMessage("Please wait a moment before starting the upload test...");
    await delay(2000); // 2-second delay between tests
    setDelayMessage("");

    setStatusMessage("Testing upload speed...");
    await testUploadSpeed();

    setStatusMessage(""); // Clear the status message after tests are completed
    setDelayMessage(
      "Tests are completed. Please wait 10 seconds before starting a new test."
    );
    await delay(10000); // 10-second delay after tests are complete

    setIsTesting(false);
    setDelayMessage("");
    setShowResults(true); // Show results after the test
  };

  const testDownloadSpeed = async () => {
    setProgress(0); // Ensure progress is reset before starting the test
    setDownloadSpeed(null); // Reset download speed

    const startTime = new Date().getTime();
    const fileSizeInBytes = 30000000; // 30MB file size

    try {
      await axios.get("https://www.speedtest.aryo.ai/test-file/30mb.zip", {
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
    const fileSizeInBytes = 30000000; // 30MB file size
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
        const variableDelay = Math.random() * 10 + 10; // Random delay
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
              {loading ? (
                <div className="text-center mt-4">
                  <Spinner animation="grow" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <>
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
                    <>
                      <div className="progress-bar-container custom-progress-bar">
                        <ProgressBar
                          now={progress}
                          label={`${progress}%`}
                          style={{ height: "30px" }}
                        />
                      </div>
                      <Row className="mt-4">
                        <Col>
                          <p className="bold-text">Ping</p>
                          <p>{ping !== null ? `${ping} ms` : ""}</p>
                        </Col>
                        <Col>
                          <p className="bold-text">Download</p>
                          <p>{downloadSpeed ? downloadSpeed : ""}</p>
                        </Col>
                        <Col>
                          <p className="bold-text">Upload</p>
                          <p>{uploadSpeed ? uploadSpeed : ""}</p>
                        </Col>
                      </Row>
                      <p className="text-center mt-4">{statusMessage}</p>
                    </>
                  )}
                  {showResults && (
                    <Row className="mt-4">
                      <Col>
                        <p className="bold-text">Ping</p>
                        <p>{ping !== null ? `${ping} ms` : "N/A"}</p>
                      </Col>
                      <Col>
                        <p className="bold-text">Download</p>
                        <p>{downloadSpeed ? downloadSpeed : "N/A"}</p>
                      </Col>
                      <Col>
                        <p className="bold-text">Upload</p>
                        <p>{uploadSpeed ? uploadSpeed : "N/A"}</p>
                      </Col>
                    </Row>
                  )}
                  {delayMessage && <p>{delayMessage}</p>}
                </>
              )}
            </Card.Body>
            <Card.Footer className="custom-card-footer">
              <strong>Note:</strong>
              <ol className="custom-list">
                <li>The test server uses GitHub servers.</li>
                <li>
                  There is a delay of 10 seconds before starting a new test to
                  ensure optimal result.
                </li>
                <li>
                  This application is intended for testing purpose and not for
                  commercial use, so no data logging is necessary.
                </li>
              </ol>
            </Card.Footer>
          </Card>
          <p className="text-center mt-4">{renderTime && `${renderTime}`}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default SpeedTest;
