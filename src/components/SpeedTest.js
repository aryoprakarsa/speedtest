import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Container, Card, Alert, Spinner } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import CountUp from "react-countup";
import { motion } from "framer-motion";
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

const sendGAEvent = (eventCategory, eventAction, eventLabel) => {
  if (window.gtag) {
    window.gtag("event", eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
    });
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
  const [statusMessage, setStatusMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [downloadEnd, setDownloadEnd] = useState(0);
  const [uploadEnd, setUploadEnd] = useState(0);
  const [downloadUnit, setDownloadUnit] = useState("");
  const [uploadUnit, setUploadUnit] = useState("");
  const [finalPing, setFinalPing] = useState(null);
  const [finalDownloadSpeed, setFinalDownloadSpeed] = useState(null);
  const [finalUploadSpeed, setFinalUploadSpeed] = useState(null);

  useEffect(() => {
    fetchIpInfo();
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
    const pingDuration = 5000;
    const interval = 200;
    const endTime = performance.now() + pingDuration;

    while (performance.now() < endTime) {
      const startTime = performance.now();
      try {
        await axios.get("https://speedtest.aryo.ai");
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
      setFinalPing(averagePing.toFixed(2));
      sendGAEvent(
        "Speed Test",
        "Ping Test Completed",
        `Ping: ${averagePing.toFixed(2)} ms`
      );
    } else {
      setPing(null);
      setFinalPing(null);
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
    await delay(2000);
    setDelayMessage("");

    setStatusMessage("Testing upload speed...");
    await testUploadSpeed();

    setStatusMessage("");
    setDelayMessage("Please wait 10 seconds before taking another test.");
    await delay(10000);

    setIsTesting(false);

    setDelayMessage("");
    setShowResults(true);
  };

  const testDownloadSpeed = async () => {
    setProgress(0);

    const startTime = new Date().getTime();
    const fileSizeInBytes = 30000000;

    try {
      await axios.get(process.env.REACT_APP_TEST_FILE_URL, {
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
          setFinalDownloadSpeed(`${speed} ${unit}`);
        },
      });
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      const { speed, unit } = bytesToReadableSpeed(speedInBps);
      setDownloadSpeed(`${speed} ${unit}`);
      sendGAEvent(
        "Speed Test",
        "Download Test Completed",
        `Download Speed: ${speed} ${unit}`
      );
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const testUploadSpeed = async () => {
    setProgress(0);

    const startTime = new Date().getTime();
    const fileSizeInBytes = 30000000;
    const testFile = new Blob([new Uint8Array(fileSizeInBytes)], {
      type: "application/octet-stream",
    });

    try {
      await delay(100);

      for (let i = 0; i <= 100; i++) {
        const variableDelay = Math.random() * 10 + 10;
        await new Promise((resolve) => setTimeout(resolve, variableDelay));

        const durationInSeconds = (new Date().getTime() - startTime) / 1000;
        const speedInBps =
          (fileSizeInBytes * i * 8) / (100 * durationInSeconds);
        const { speed, unit } = bytesToReadableSpeed(speedInBps);
        setUploadEnd(speed);
        setUploadUnit(unit);
        setProgress(i);
        setFinalUploadSpeed(`${speed} ${unit}`);
      }

      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedInBps = (fileSizeInBytes * 8) / durationInSeconds;
      const { speed, unit } = bytesToReadableSpeed(speedInBps);
      setUploadSpeed(`${speed} ${unit}`);
      sendGAEvent(
        "Speed Test",
        "Upload Test Completed",
        `Upload Speed: ${speed} ${unit}`
      );
    } catch (error) {
      console.error("Error uploading the file:", error);
    }
  };

  return (
    <Container
      fluid
      className="bg-light min-vh-100 d-flex align-items-center py-5"
    >
      <Helmet>
        <title>Speed Test Application</title>
        <meta
          name="description"
          content="Test your download and upload speeds with our Speed Test Application."
        />
      </Helmet>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <Card.Header
              as="h1"
              className="text-center bg-primary text-white py-4"
            >
              Internet Speed Test
            </Card.Header>
            <Card.Body className="text-center p-4">
              {loading ? (
                <div className="text-center mt-4">
                  <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <>
                  {ipInfo.ip && (
                    <Alert variant="info" className="mb-4">
                      <Row className="g-2">
                        <Col xs={12} md={4}>
                          <strong>IP Address:</strong> {ipInfo.ip}
                        </Col>
                        <Col xs={12} md={4}>
                          <strong>ISP:</strong> {ipInfo.org}
                        </Col>
                        <Col xs={12} md={4}>
                          <strong>ASN:</strong> {ipInfo.asn}
                        </Col>
                      </Row>
                    </Alert>
                  )}
                  {!isTesting && (
                    <motion.div
                      className="start-button-container"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.button
                        className="start-button"
                        onClick={testSpeed}
                        disabled={isTesting}
                        initial={{
                          boxShadow: "0px 0px 0px rgba(0, 123, 255, 0)",
                        }}
                        animate={{
                          boxShadow: "0px 0px 20px rgba(0, 123, 255, 0.5)",
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        <motion.span
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          Start
                        </motion.span>
                      </motion.button>
                    </motion.div>
                  )}
                  {isTesting && (
                    <>
                      <motion.div
                        className="progress-circle-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="progress-circle"
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                        >
                          <div className="progress-circle-bar">
                            <motion.div
                              className="progress-circle-progress"
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${progress}, 100` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                      <Row className="mt-4">
                        <Col xs={12} md={4}>
                          <p className="lead mb-1">Ping</p>
                          <p className="display-6">
                            <CountUp
                              end={parseFloat(ping) || 0}
                              duration={1}
                              decimals={2}
                            />{" "}
                            ms
                          </p>
                        </Col>
                        <Col xs={12} md={4}>
                          <p className="lead mb-1">Download</p>
                          <p className="display-6">
                            <CountUp
                              end={parseFloat(downloadEnd) || 0}
                              duration={1}
                              decimals={2}
                            />{" "}
                            {downloadUnit}
                          </p>
                        </Col>
                        <Col xs={12} md={4}>
                          <p className="lead mb-1">Upload</p>
                          <p className="display-6">
                            <CountUp
                              end={parseFloat(uploadEnd) || 0}
                              duration={1}
                              decimals={2}
                            />{" "}
                            {uploadUnit}
                          </p>
                        </Col>
                      </Row>
                    </>
                  )}
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="shadow-sm mt-5">
                        <Card.Body>
                          <h3 className="mb-4">Final Results</h3>
                          <Row className="g-4">
                            <Col xs={12} md={4}>
                              <p className="lead mb-1">Ping</p>
                              <p className="display-6">
                                {finalPing !== null ? `${finalPing} ms` : "N/A"}
                              </p>
                            </Col>
                            <Col xs={12} md={4}>
                              <p className="lead mb-1">Download</p>
                              <p className="display-6">
                                {finalDownloadSpeed
                                  ? finalDownloadSpeed
                                  : "N/A"}
                              </p>
                            </Col>
                            <Col xs={12} md={4}>
                              <p className="lead mb-1">Upload</p>
                              <p className="display-6">
                                {finalUploadSpeed ? finalUploadSpeed : "N/A"}
                              </p>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  )}
                  {delayMessage && (
                    <p className="mt-3 text-muted">{delayMessage}</p>
                  )}
                  <Card className="mt-5 shadow-sm">
                    <Card.Body>
                      <h3 className="mb-4 text-primary">Notes</h3>
                      <Row className="g-4">
                        <Col xs={12} md={6}>
                          <div className="note-item">
                            <div className="note-icon">
                              <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="note-content">
                              <h4>Test Interval</h4>
                              <p>
                                There is a delay of 10 seconds before taking
                                another test to ensure optimal results.
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} md={6}>
                          <div className="note-item">
                            <div className="note-icon">
                              <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="note-content">
                              <h4>Usage</h4>
                              <p>
                                This application is intended for testing
                                purposes and not for commercial use, so no data
                                logging is necessary.
                              </p>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </Container>
  );
};

export default SpeedTest;
