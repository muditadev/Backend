const { Router } = require("express");
const {
  createSOS,
  updateSOSById,
  getSOSById,
  getAllSOS,
  deleteSOSById,
} = require("../controllers/sos");

// Initialize Firebase

const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const { firebaseConfig } = require("../config/firebase_config");
const { config } = require("dotenv");
config();

const multer = require("multer");
const path = require("path");

// Initialize a firebase application
initializeApp(firebaseConfig);
// console.log(`api key of firebase is `, firebaseConfig.apiKey);

// Initialize cloud storage and get a reference to the service
const storage = getStorage();

// Setting up multer as a middleware to grab photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

// Middleware for handling file uploads
const uploadMiddleware = upload.fields([{ name: "video", maxCount: 1 }]);

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};
const router = Router();

//  Upload API
router.post("/create", uploadMiddleware, async (req, res) => {
  try {
    // Ensure req.files is defined
    if (!req.files) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // Upload files to Firebase Storage
    const fileUrls = await Promise.all(
      Object.entries(req.files).map(async ([fieldName, files]) => {
        if (!Array.isArray(files)) {
          files = [files];
        }

        // Upload each file
        const uploadedFiles = await Promise.all(
          files.map(async (file) => {
            try {
              const dateTime = giveCurrentDateTime();
              const storageRef = ref(
                storage,
                `SOS/${file.originalname}_${dateTime}`
              );

              // Create file metadata including the content type
              const metadata = {
                contentType: file.mimetype,
              };

              // Upload the file in the bucket storage
              const snapshot = await uploadBytesResumable(
                storageRef,
                file.buffer,
                metadata
              );

              // Grab the public url
              const downloadURL = await getDownloadURL(snapshot.ref);

              return {
                fieldName,
                originalname: file.originalname,
                downloadURL,
              };
            } catch (error) {
              console.error(`Error uploading ${fieldName}:`, error);
              return null; // Handle the error as needed
            }
          })
        );

        return uploadedFiles.filter((file) => file !== null);
      })
    );

    // Construct an object with file URLs
    const formattedFileUrls = fileUrls.reduce((acc, files) => {
      files.forEach((file) => {
        acc[file.fieldName] = acc[file.fieldName] || [];
        acc[file.fieldName].push({
          originalname: file.originalname,
          downloadURL: file.downloadURL,
        });
      });
      return acc;
    }, {});

    await createSOS(req, res, formattedFileUrls);
  } catch (error) {
    console.error("Error handling file uploads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update
router.put("/update/:id", uploadMiddleware, async (req, res) => {
  try {
    // Ensure req.files is defined
    if (!req.files) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // Upload files to Firebase Storage
    const fileUrls = await Promise.all(
      Object.entries(req.files).map(async ([fieldName, files]) => {
        if (!Array.isArray(files)) {
          files = [files];
        }

        // Upload each file
        const uploadedFiles = await Promise.all(
          files.map(async (file) => {
            try {
              const dateTime = giveCurrentDateTime();
              const storageRef = ref(
                storage,
                `SOS/${file.originalname}_${dateTime}`
              );

              // Create file metadata including the content type
              const metadata = {
                contentType: file.mimetype,
              };

              // Upload the file in the bucket storage
              const snapshot = await uploadBytesResumable(
                storageRef,
                file.buffer,
                metadata
              );

              // Grab the public url
              const downloadURL = await getDownloadURL(snapshot.ref);

              return {
                fieldName,
                originalname: file.originalname,
                downloadURL,
              };
            } catch (error) {
              console.error(`Error uploading ${fieldName}:`, error);
              return null; // Handle the error as needed
            }
          })
        );

        return uploadedFiles.filter((file) => file !== null);
      })
    );

    // Construct an object with file URLs
    const formattedFileUrls = fileUrls.reduce((acc, files) => {
      files.forEach((file) => {
        acc[file.fieldName] = acc[file.fieldName] || [];
        acc[file.fieldName].push({
          originalname: file.originalname,
          downloadURL: file.downloadURL,
        });
      });
      return acc;
    }, {});

    await updateSOSById(req, res, formattedFileUrls);
  } catch (error) {
    console.error("Error handling file uploads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/getbyId/:id", getSOSById);
router.get("/getAll", getAllSOS);
router.delete("/delete/:id", deleteSOSById);

module.exports = router;
