 Here's how you can run and test the application

## Prerequisites:

1. You should have Node.js and yarn installed - you can download Node.js from [here](https://nodejs.org/) and yarn from [here](https://yarnpkg.com/).
2. The application involves both a frontend (React) and a backend (Express.js), presumably in separate directories.
3. The Axios and React-Bootstrap libraries must be installed for the React application. Install them using yarn with the commands `yarn add axios react-bootstrap`.

## Instructions to Run and Test the Application:

1. **Run the backend:**
   - Navigate to the backend directory using a terminal or command prompt.
   - Install the necessary dependencies by running `yarn install`.
   - Start the server using `yarn start` or `node index.js`.
   - My server will be running on `http://localhost:5001` or whichever port I've set in my .env file.

2. **Run the frontend:**
   - Navigate to the frontend directory in a different terminal or command prompt window.
   - Install the necessary dependencies by running `yarn install`.
   - Start the frontend using `yarn start`.
   - The frontend should open in my default web browser, typically at `http://localhost:3000`.

3. **Test the application:**
   - Upload a file: After navigating to the webpage, I can see the upload button. By clicking on it, selecting a file, and submitting, I should be able to upload files.
   - List files: After uploading, the files should be visible in individual cards on the homepage.
   - View files: I can click on the "View File" button on each card to preview the file.

## Description of Main Architecture and Design of the Application:

My application is a file-sharing platform with a frontend built using React and a backend built using Express.js. 

1. **Frontend (React):**
   - The frontend is created using React for the UI, React-Bootstrap for styling, and Axios for making HTTP requests to the backend.
   - The main components include an `UploadModal` for uploading files and a `ListFiles` for displaying the uploaded files.

2. **Backend (Express.js):**
   - The backend server is built using Express.js and hosted on AWS S3, configured with IAM user policies over roles for convenience.
   - It includes routes for file uploading (`/upload`), listing files (`/list/uploads`), and viewing files (`/view/:filename`).
   - Uploaded files are stored in an S3 bucket, and the backend fetches and sends them to the frontend.

The overall design of the application is based on a client-server model, where the React client communicates with the Express server over HTTP. The server manages the storage and retrieval of files on S3, while the client provides a user interface for these operations. The files are stored securely on AWS S3 and accessed using signed URLs for security and convenience.

## To setup an AWS S3 Bucket. You will need to setup an AWS Account:

1. **Sign up for AWS**

    - If you don't have an AWS account, you can create one at AWS Console.
2. **Create an S3 bucket**

    - Navigate to the S3 service from the AWS Management Console.
    - Click on the "Create bucket" button and follow the prompts to create your S3 bucket. Make note of the bucket name you chose.
    - Ensure that your bucket permissions align with your needs.
3. **Create an IAM User**

    - Navigate to the IAM (Identity and Access Management) service from the AWS Management Console.
    - Click on "Users" in the navigation panel, and then "Add user".
    - Give the user a name, select "Programmatic access" for Access type, and click "Next".
    - In the permissions section, you can grant this user full S3 permissions by attaching the AmazonS3FullAccess policy.
    - Follow the rest of the prompts to create the user. After the user is created, you will be given an **Access Key ID** and a **Secret Access Key** these will be used in your app environment to grant you permissions to manipulate the S3 bucket. Make sure to save these in a safe place, as you will not be able to view the secret access key again.

