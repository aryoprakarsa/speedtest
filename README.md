# Speed Test Application

This project is a React-based Speed Test Application that allows users to test their internet connection's ping, download, and upload speeds. The application provides real-time updates during the testing process and displays the final results after the tests are completed.

## Features

- Measure ping, download, and upload speeds.
- Real-time updates during the testing process.
- Final results display.
- Displays user's IP address, ISP, and ASN information.
- Logs events to Google Analytics.

## Technologies Used

- React
- Axios
- React-Bootstrap
- Framer Motion
- React-Helmet-Async
- CSS

## Setup and Installation

1. Clone the repository:

```sh
git clone https://github.com/aryoprakarsa/speedtest.git
cd speedtest
```

2. Install dependencies:

```sh
npm install
```

3.  Create a .env file in the root directory and add your environment variables:

```sh
REACT_APP_TEST_FILE_URL=https://example.com/testfile
```

4. Run the application:

```sh
npm start
```

### Usage

1. Open the application in your browser.
2. Click the "Start" button to begin the speed test.
3. View the real-time updates as the test progresses.
4. Once the test is completed, view the final results.

#### Code Overview

`SpeedTest.js`
This component handles the main logic for the speed test application, including:

- Fetching IP and ISP information.
- Measuring ping, download, and upload speeds.
- Updating the UI with real-time data.
- Sending events to Google Analytics.

`SpeedTestResults.css`
This CSS file contains the styles for the Speed Test application, ensuring a clean and responsive design.

`Event Logging`
The application logs events to Google Analytics using the `sendGAEvent` function, which captures various metrics such as ISP, ASN, ping, download, and upload speeds.

#### Example Usage

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Container, Card, Alert, Spinner } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SpeedTestResults.css";

const SpeedTest = () => {
  // State and function definitions

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
              {/_ Loading spinner and test results _/}
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </Container>
  );
};

export default SpeedTest;
```

## License

This project is licensed under the MIT License - see the [License](https://github.com/aryoprakarsa/speedtest?tab=MIT-1-ov-file) for details.

## Acknowledgments

- Inspiration for the project from various online speed test applications.
- Icons from FontAwesome.
