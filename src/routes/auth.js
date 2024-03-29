const { Router } = require("express");
const {
  registerMentor,
  login,
  protected,
  logout,
  registerMentee,
  getAllMentees,
  getAllMentors,
  getMentorById,
  getMenteeById,
  updateMentorProfile,
  updateMenteeProfile,
  approveMentorProfile,
} = require("../controllers/auth");
const {
  validationMiddleware,
} = require("../middlewares/validations-middleware");
const { registerValidation, loginValidation } = require("../validators/auth");
const { userAuth } = require("../middlewares/auth-middleware");
const router = Router();

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

// Mentor Middleware for handling file uploads
const uploadMiddleware_mentor = upload.fields([
  { name: "profile_img", maxCount: 1 },
  { name: "pancard_img", maxCount: 1 },
  { name: "adharcard_front_img", maxCount: 1 },
  { name: "adharcard_back_img", maxCount: 1 },
  { name: "doctor_reg_cert_img", maxCount: 1 },
]);

// Mentee Middleware for handling file uploads
const uploadMiddleware_mentee = upload.fields([
  { name: "profile_img", maxCount: 1 },
]);

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
};

//  Register Mentor
router.post(
  "/registerMentor",
  uploadMiddleware_mentor,
  registerValidation,
  validationMiddleware,
  async (req, res) => {
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
                  `User/${file.originalname}_${dateTime}`
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

      await registerMentor(req, res, formattedFileUrls);
    } catch (error) {
      console.error("Error handling file uploads:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
//  Update Mentor
router.put(
  "/updateMentor/:user_id",
  uploadMiddleware_mentor,
  async (req, res) => {
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
                  `User/${file.originalname}_${dateTime}`
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

      await updateMentorProfile(req, res, formattedFileUrls);
    } catch (error) {
      console.error("Error handling file uploads:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get Routes
router.get("/getallMentees", getAllMentees);
router.get("/getallMentors", getAllMentors);
router.get("/getMentors/:user_id", getMentorById);
router.get("/getMentees/:user_id", getMenteeById);
router.get("/protected", userAuth, protected);
router.post("/login", loginValidation, validationMiddleware, login);
router.get("/logout", logout);

// Register Mentee
router.post(
  "/registerMentee",
  registerValidation,
  validationMiddleware,
  registerMentee
);
// Update Mentee Profile
router.put(
  "/updateMentee/:user_id",
  uploadMiddleware_mentee,
  async (req, res) => {
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
                  `User/${file.originalname}_${dateTime}`
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

      await updateMenteeProfile(req, res, formattedFileUrls);
    } catch (error) {
      console.error("Error handling file uploads:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Approve Mentor Profile
router.get("/approveMentor/:user_id", approveMentorProfile);

module.exports = router;
