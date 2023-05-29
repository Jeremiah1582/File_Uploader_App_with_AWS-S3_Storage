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



app.use("*", (req, res) => {
    res.status(404).send("404 this page doesn't exist");
});

// server
app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
})
