import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import React from "react";
import AlertComp from "./AlertComp";
import { MyContext } from "../contextAPI/MyContext";
// This is the main ListFiles component

function ListFilesComp() {
  // Destructure context values
  const { urls, files, viewFile, handleFileShare, deleteFile } =
    React.useContext(MyContext);

  return (
    <div className="cardContainer">
      <AlertComp></AlertComp>

      {files.map((file, index) => (
        <Card
          key={file}
          style={{
            width: "18rem",
            height: "fitContent",
            margin: "10px",
          }}
        >
          <Card.Header style={{ background: " #ffb703" }}>
            <Card.Title>{file}</Card.Title>
          </Card.Header>
          <Card.Body
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0",
            }}
          >
            <iframe
              className="iframeElement"
              title={file}
              src={`${urls[index]}`}
              width="inherit"
              height="100%"
            />
          </Card.Body>
          <Card.Footer className="footer">
            <Button onClick={(e) => viewFile(e, urls[index])}>View File</Button>

            <Button variant="success" onClick={(e) => handleFileShare(file)}>
              share
            </Button>

            <Button variant="danger" onClick={(e) => deleteFile(e, file)}>
              delete
            </Button>
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
}

export default ListFilesComp;
