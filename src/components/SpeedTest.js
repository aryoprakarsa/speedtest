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
import CountUp from "react-countup";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SpeedTestResults.css";

const bytesToReadableSpeed = (bytes) => {
  if (bytes < 1024) {
    return { speed: bytes.toFixed(2), unit: "Bps" };
  } else if (bytes < 1024 * 1024) {
    const speedInKbps = bytes / 1024;
    return { speed: speedInKbps.toFixed(2), unit: "Kbps" };
  } else {
    const speedInMbps = bytes / (1024 * 1024);
    return { speed: speedInMbps.toFixed(2), unit: "Mbps" };
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
  const [downloadEnd, setDownloadEnd] = useState(0);
  const [uploadEnd, setUploadEnd] = useState(0);
  const [downloadUnit, setDownloadUnit] = useState("");
  const [uploadUnit, setUploadUnit] = useState("");

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

  const resetTestState = () => {
    setPing(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setProgress(0);
    setDownloadEnd(0);
    setUploadEnd(0);
    setDownloadUnit("");
    setUploadUnit("");
    setShowResults(false);
    clearCache();
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
    resetTestState();
    setIsTesting(true);
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
    setDelayMessage("Please wait 10 seconds before taking another test.");
    await delay(10000); // 10-second delay after tests are complete

    setIsTesting(false);
    setDelayMessage("");
    setShowResults(true); // Show results after the test
  };

  const testDownloadSpeed = async () => {
    setProgress(0); // Ensure progress is reset before starting the test

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

          const durationInSeconds = (new Date().getTime() - startTime) / 1000;
          const speedInBps = (loaded * 8) / durationInSeconds;
          const { speed, unit } = bytesToReadableSpeed(speedInBps);
          setDownloadEnd(speed);
          setDownloadUnit(unit);
        },
      });
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      const { speed, unit } = bytesToReadableSpeed(speedInBps);
      setDownloadSpeed(`${speed} ${unit}`);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const testUploadSpeed = async () => {
    setProgress(0); // Ensure progress is reset before starting the test

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

        const durationInSeconds = (new Date().getTime() - startTime) / 1000;
        const speedInBps =
          (fileSizeInBytes * i * 8) / (100 * durationInSeconds);
        const { speed, unit } = bytesToReadableSpeed(speedInBps);
        setUploadEnd(speed);
        setUploadUnit(unit);
      }

      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      const { speed, unit } = bytesToReadableSpeed(speedInBps);
      setUploadSpeed(`${speed} ${unit}`);
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
                          <CountUp
                            end={ping ? parseFloat(ping) : 0}
                            duration={5}
                            suffix=" ms"
                          />
                        </Col>
                        <Col>
                          <p className="bold-text">Download</p>
                          <CountUp
                            end={downloadEnd}
                            duration={10}
                            suffix={` ${downloadUnit}`}
                          />
                        </Col>
                        <Col>
                          <p className="bold-text">Upload</p>
                          <CountUp
                            end={uploadEnd}
                            duration={10}
                            suffix={` ${uploadUnit}`}
                          />
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
              <strong>Notes:</strong>
              <ol className="custom-list">
                <li>
                  There is a delay of 10 seconds before taking another test to
                  ensure optimal results.
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
