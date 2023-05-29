import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { MyContext } from "../contextAPI/MyContext";

function UploadModalComp() {
  const { refreshFunc, backendRootURL } = React.useContext(MyContext);

  // State variables for modal visibility and file
  const [show, setShow] = useState(false);
  const [files, setFiles] = useState([]);

  // Modal handling functions
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Function to handle files input change
  const handleInput = (e) => {
    
    setFiles([...files,...Array.from(e.target.files)]);
  
  };
 
  // Function to handle file upload
  // Function to handle file upload
const handleUpload = async (e) => {
  e.preventDefault();
  if (!files) {
    console.log("Please select a file to upload");
    return;
  }
  try {
    console.log('trying to send file to backend....');
    const formData = new FormData();
    files.map((file)=>{
      formData.append('newFile',file);
    });

    console.log('formData is...',formData);

    // asynchronously upload files
    const uploadPromises = files.map(file => {
      const formData = new FormData();
      formData.append('newFile', file);
      return axios.post(`${backendRootURL}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    });

    const responses = await Promise.all(uploadPromises);
    responses.forEach(response => {
      if (response.status === 200) {
        console.log('successfully uploaded file...', response);
      } else {
        console.log("upload unsuccessful", response.status);
      }
    });
    handleClose();
    refreshFunc();
    setFiles([]);
  } catch (error) {
    console.log(error);
  }
};


  React.useEffect(() => {
    console.log(' file are...... ',files);
  }, [files]);
  return (
    <>
    <Button
      style={{ marginTop: "100px" }}
      variant="primary"
      onClick={handleShow}
    >
      Upload New File
    </Button>

    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select the files you want to upload</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form 
        onSubmit={handleUpload} encType="multipart/form-data"
       
        >
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Upload files</Form.Label>

            <Form.Control
              type="file"
              placeholder="click to add file"
              name="newFile"
              onChange={handleInput}
              multiple
              
            />
            <Form.Text className="text-muted">
              upload your data to the local file system
            </Form.Text>
          </Form.Group>
          <Button type="submit" variant="primary">
            Upload
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  )
}

export default UploadModalComp