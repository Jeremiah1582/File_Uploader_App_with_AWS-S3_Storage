// const required modules
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express(); // initiaize express app
const PORT = process.env.PORT || 5001;
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
require("dotenv").config();
// import AWS SDK
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");

// Use middleware
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// Multer middleware for handling multipart/form-data, which is primarily used for file uploads
const upload = multer({ dest: "uploads/" });
const { createReadStream } = require("fs");

// AWS s3 bucket configuration
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// routes
app.get("/", (req, res) => {
  console.log("hello world");
});
// upload new object
app.post("/upload", upload.array("newFile", 10), async (req, res) => {
  // Variables
  const files = req.files;
  // Async functions
  const replaceSpaces = (name) => {
    return name.replace(/ /g, "_");
  };
  const deleteFileAfterUpload = async (file) => {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error({ message: "Error deleting file", error });
      // Save error information and continue processing the remaining files
      return { error };
    }
  };

  console.log("this is files ....", files);

  if (!files) {
    return res.status(400).send("No file received");
  }
  try {
    const uploadPromises = files.map(async (file) => {
      const fileStream = createReadStream(file.path);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: replaceSpaces(uuidv4() + "-" + file.originalname), // Using UUID for unique file names
        Body: fileStream, // using buffer would be quicker but image file isnt displayed correctly to client
        ContentType: file.mimetype,
        ContentDisposition: "inline",
      };
      try {
        const uploadData = await s3.send(new PutObjectCommand(params));
        deleteFileAfterUpload(file);
        return uploadData;
      } catch (error) {
        console.log("PUTOBJEctCommand error uploading file", error);
      }
    });

    const uploadResults = await Promise.all(uploadPromises); // Wait for all uploads to finish
    const failedUploads = uploadResults.filter((result) => result.error);

    if (failedUploads.length > 0) {
      return res.status(500).send("Some files failed to upload");
    }
    res.status(200).send("Files uploaded successfully to S3");
  } catch (err) {
    console.error({ message: "Error uploading file to S3", error: err });
    res.status(500).send("Error uploading file");
  }
});
// SHOW File list
app.get("/listFiles", async (req, res) => {
  console.log("list files");
  try {
    // declare variables
    const filesMetaData = []; // You had a typo here. It should be filesMetaData, not fileMetaData.
    const files = [];
    const urls = [];

    const listObjectInBucket = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
    });

    await s3.send(listObjectInBucket).then(async (data) => {
      for (let file of data.Contents) {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: file.Key, // file name
        });
        // declare URL
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
        // declare metadata
        const metaData = await s3.send(
          new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.Key,
          })
        );

        urls.push(url);
        files.push(file.Key);
        filesMetaData.push(metaData); // It should be filesMetaData, not filesMeaData.
      }
      if (files.length === 0) {
        return res.status(404).send("No files found");
      }
      res.status(200).send({ files, urls, filesMetaData });
    });
  } catch (error) {
    // Always include error handling in your asynchronous functions.
    console.error("An error occurred:", error);
  }
});
// SHARE file
app.get("/share/:filename", async (req, res) => {
  console.log("share file");
  try {
    const listObjectInBucket = new ListObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
    });
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.filename, // file name
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
    res.status(200).send({ url });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send({ error });
  }
});

// DELETE file
app.get("/deleteFile/:id", async (req, res) => {
  console.log("delete file", req.params.id);
  try {
    // declare params
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.id,
    };
    // delete file
    await s3.send(new DeleteObjectCommand(params)).then((response) => {
      if (response.$metadata.httpStatusCode !== 204) {
        console.error(response);
        return res.status(500).send({ error: response });
      }
      console.log(`File deleted successfully..... ${response.data}`);
      return res
        .status(200)
        .send({ message: "File deleted successfully....." });
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).send({ error: error });
  }
});
// 404 Route to handle all other requests
app.use("*", (req, res) => {
  res.status(404).send("404 this page doesn't exist");
});

// Start server
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
