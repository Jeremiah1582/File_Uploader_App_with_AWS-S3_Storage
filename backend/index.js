// const required modules 
const express  =require("express");
const cors =require("cors");
const fs =require("fs")
const path =require("path")
const app = express();
const PORT = process.env.PORT || 5001;
const { v4: uuidv4 } =require("uuid")
const multer =require("multer")

require("dotenv").config();
// import AWS V3 SDK methods

const {getSignedUrl} =require( "@aws-sdk/s3-request-presigner")

const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsCommand,
    DeleteObjectCommand,
    HeadObjectCommand
} =require( "@aws-sdk/client-s3")

// middleware 
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// multer middleware
const upload = multer({dest: "uploads/"});

// AWS s3 bucket configuration
const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// routes
app.get("/", (req, res) => {  
    console.log("hello world");
});

// upload new object 
app.post("/upload", upload.array("newFile", 10), async (req, res) => {
  const files = req.files;
  
  if (!files) {
    return res.status(400).send("No file received");
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const fileStream = createReadStream(file.path);
      const params = {
        Bucket: awsBucketName,
        Key: replaceSpaces(uuidv4()+"-"+file.originalname), // Using UUID for unique file names
        Body: fileStream, // using buffer would be quicker but image file isnt displayed correctly to client
          ContentType: file.mimetype,
          ContentDisposition: 'inline',
      };

      try {
        const uploadData = await s3.send(new PutObjectCommand(params));
        fs.unlink(file.path);
        return uploadData;
      } catch (error) {
        console.error({ message: "Error uploading or deleting file", error });
        // Save error information and continue processing the remaining files
        return { error };
      }
    });

    const uploadResults = await Promise.all(uploadPromises); // Wait for all uploads to finish
    const failedUploads = uploadResults.filter(result => result.error);

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
      const filesMetaData=[]; // You had a typo here. It should be filesMetaData, not fileMetaData.
      const files=[];
      const urls=[];

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
              const metaData = await s3.send(new HeadObjectCommand({
                  Bucket: process.env.AWS_BUCKET_NAME, 
                  Key: file.Key
              }));
              
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
app.get("/share:filename", (req, res)=>{
  console.log("share file");
  try {
      const listObjectInBucket = new ListObjectsCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
      });
      const command = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: req.params.filename, // file name
      });
      const url = getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour
      res.status(200).send({ url });
  } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).send({ error });
  }
});

// DELETE file
app.delete("/deleteFile:filename", async (req, res)=>{
  log("delete file");
  try {
      // declare params
      const params = {
        Bucket: awsBucketName,
        Key: req.params.filename,
      };
      // delete file
      await s3.send(new DeleteObjectCommand(params)).then((response) => {
        if (response.$metadata.httpStatusCode !== 204) {
          console.error(response);
          return res.status(500).send({ error: response });
        }
        console.log(`File deleted successfully..... ${response}`);
        return res
          .status(200)
          .send({ message: "File deleted successfully....." });
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      return res.status(500).send({ error: error });
    }
})

app.use("*", (req, res) => {
    res.status(404).send("404 this page doesn't exist");
});

// server
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})
