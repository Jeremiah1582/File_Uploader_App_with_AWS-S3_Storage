import React, {useState, createContext, useEffect} from "react";
import axios from "axios";

// Create a new context named 'MyContext'
export const MyContext = createContext();

// This is the main MyProvider component, which provides the state and methods to its children
export default function MyProvider({children}) {
  const backendRootURL ='http://localhost:5001';
  // State variables for files and directory
  const [files, setFiles] = useState([])
  const [urls, setUrls] = useState([])
  const [directory, setDirectory] = useState('')
const [shareableLink, setShareableLink] = useState('')
const [showAlert, setShowAlert] = useState(false)
  // Function to refresh the files
  const refreshFunc = async () => {
    console.log('running refreshFunc');
    await getFiles();  
  }
    
  // Function to get the list of files from the backend
  const getFiles = async () => {
    try {
      const response = await axios.get(`${backendRootURL}/listFiles/`);
      console.log('list uploads response is....', response);
      setFiles(response.data.files)
      setUrls(response.data.urls)
      setDirectory(response.data.directory)
    } catch (error) {
      console.error('Error getting files:', error);
      // Handle error appropriately
    }
  }
  // File share link function
  const handleFileShare = async (fileName) => {
    // Implement handleFileShare functionality
    try {
      setShowAlert(true)
      console.log('handleFileShare filename is....', fileName)

      const response = await axios.get(`${backendRootURL}/share/${fileName}`)
      console.log('handleFileShare response is....', response);
      navigator.clipboard.writeText(response.data.url) // copies url to clipboard
      setShareableLink(response.data.url) //url is the response from the backend
    }catch (error) {
      console.log('problem sharing file',error);
    }
  }


  // Function to view file, open it in a new tab
  const viewFile = async (e,url) => {
    e.preventDefault();

    window.open(url, '_blank');
    // Continue with existing viewFile implementation
  }

  // Delete file function
  const deleteFile = async (e,file) => {
e.preventDefault();
console.log('delete file filename is....', file)
   try {
    await axios
    .get(`http://localhost:5001/deleteFile/${file}`)
    .then((response) => {
      console.log('delete file response is ...',response);
    getFiles()
    })
    
  } catch (error) {
    console.log('problem deleting file',error);
   }
  }

  useEffect(() => {
    getFiles();
  }, []);

  // The MyProvider component renders its children within a MyContext.Provider component
  // This allows its children to access the provided state and methods
  return (
    <MyContext.Provider value={{
      refreshFunc, 
      getFiles, 
      files,  
      directory, 
      setDirectory,
      viewFile, 
      handleFileShare,
      deleteFile,
      urls,
      shareableLink,
      showAlert,
      setShowAlert,
      backendRootURL
      }}
      >
      {children}
    </MyContext.Provider>
  )
}
