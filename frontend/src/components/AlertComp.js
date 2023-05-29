import React, { useState } from "react";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Toast from "react-bootstrap/Toast";

import { MyContext } from "../contextAPI/MyContext";
// This is the main ListFiles component
// Destructure context values

function AlertComp(props) {
  const { showAlert, setShowAlert } = React.useContext(MyContext);

  return (
    <Row>
      <Col xs={6}>
        <Toast
          onClose={() => setShowAlert(false)}
          show={showAlert}
          delay={3000}
          autohide
          variant="success"
        >
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded me-2"
              alt=""
            />
            <strong className="me-auto"></strong>
            <small>
              copied link to clipboard! link will expire in 10 mins!
            </small>
          </Toast.Header>
        </Toast>
      </Col>
      <Col xs={6}></Col>
    </Row>
  );
}

export default AlertComp;
