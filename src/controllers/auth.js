const db = require("../../db.js");
const { hash } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { SECRET } = require("../constants");
const { initializeApp } = require("firebase/app");

const admin = require("firebase-admin");
const { firebaseConfig } = require("../config/firebase_config");
initializeApp(firebaseConfig);
const { getStorage, ref, deleteObject } = require("firebase/storage");
const storage = getStorage();
// Get By Id Mentees

exports.getMenteeById = async (req, res) => {
  const userId = req.params.user_id; // Assuming user_id is passed as a parameter
  // console.log(req);

  try {
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, users.profile_img, mentees.dob, mentees.occupation
      FROM users
      INNER JOIN mentees ON users.user_id = mentees.user_id
      WHERE users.user_id = $1;
    `;

    const { rows } = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Mentee not found",
      });
    }

    const menteeData = rows[0];
    return res.status(200).json({
      success: true,
      data: menteeData,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get By Id Mentors

exports.getMentorById = async (req, res) => {
  const userId = req.params.user_id; // Assuming user_id is passed as a parameter

  try {
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, users.profile_img, mentors.experience, mentors.degree, mentors.medical_lic_num,  mentors.pancard_img, mentors.adharcard_front_img, mentors.adharcard_back_img, mentors.doctor_reg_cert_img
      FROM users
      INNER JOIN mentors ON users.user_id = mentors.user_id
      WHERE users.user_id = $1;
    `;

    const { rows } = await db.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Mentor not found",
      });
    }

    const mentorData = rows[0];
    return res.status(200).json({
      success: true,
      data: mentorData,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get All Mentees

exports.getAllMentees = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    // Query to count total number of mentees
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM users
      WHERE role = 'mentee';
    `;
    const totalCountResult = await db.query(countQuery);
    const totalCount = parseInt(totalCountResult.rows[0].total_count);

    // Query to fetch paginated mentees
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, users.profile_img, mentees.dob, mentees.occupation
      FROM users
      INNER JOIN mentees ON users.user_id = mentees.user_id
      WHERE users.role = 'mentee'
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await db.query(query, [limit, offset]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
      },
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all mentors with pagination
exports.getAllMentors = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    // Query to count total number of mentors
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM users
      WHERE role = 'mentor';
    `;
    const totalCountResult = await db.query(countQuery);
    const totalCount = parseInt(totalCountResult.rows[0].total_count);

    // Query to fetch paginated mentors
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, mentors.experience, mentors.degree, mentors.medical_lic_num, users.profile_img, mentors.pancard_img, mentors.adharcard_front_img, mentors.adharcard_back_img, mentors.doctor_reg_cert_img
      FROM users
      INNER JOIN mentors ON users.user_id = mentors.user_id
      WHERE users.role = 'mentor'
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await db.query(query, [limit, offset]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
      },
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Register Mentees

exports.registerMentee = async (req, res) => {
  const { name, email, password, gender, dob, address, mobile } = req.body;
  const { occupation } = req.body; // Additional mentee-specific field

  try {
    // Hash the password before storing it
    const hashedPassword = await hash(password, 10);

    // Step 1: Insert data into the 'users' table
    const userInsertQuery = `
      INSERT INTO users(name, email, password, gender, address, mobile, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id;
    `;

    const userInsertValues = [
      name,
      email,
      hashedPassword,
      gender,
      address,
      mobile,
      "mentee",
    ];

    const { rows } = await db.query(userInsertQuery, userInsertValues);

    // Retrieve the user_id generated during the insertion
    const userId = rows[0].user_id;
    const userEmail = rows[0].email;

    // Step 2: Insert data into the 'mentees' table
    const menteeInsertQuery = `
      INSERT INTO mentees(user_id, dob, occupation)
      VALUES ($1, $2, $3);
    `;

    const menteeInsertValues = [userId, dob, occupation];

    await db.query(menteeInsertQuery, menteeInsertValues);

    // return res.status(201).json({
    //   success: true,
    //   message: "The Mentees registration was successful",
    // });
    req.user = { user_id: userId, email: userEmail };
    return exports.login(req, res);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Register Mentors

/*
exports.registerMentor = async (req, res) => {
  const { name, email, password, gender, address, mobile } = req.body;
  const {
    experience,
    degree,
    medical_lic_num,
    pancard_img,
    adharcard_front_img,
    adharcard_back_img,
    doctor_reg_cert_img,
  } = req.body;

  try {
    // Hash the password before storing it
    const hashedPassword = await hash(password, 10);

    // Step 1: Insert data into the 'users' table
    const userInsertQuery = `
      INSERT INTO users(name, email, password, gender, address, mobile, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id;
    `;

    const userInsertValues = [
      name,
      email,
      hashedPassword,
      gender,
      address,
      mobile,
      "mentor",
    ];

    const { rows } = await db.query(userInsertQuery, userInsertValues);

    // Retrieve the user_id generated during the insertion
    const userId = rows[0].user_id;

    // Step 2: Insert data into the 'mentors' table
    const mentorInsertQuery = `
      INSERT INTO mentors(user_id, experience, degree, medical_lic_num, pancard_img, adharcard_front_img, adharcard_back_img, doctor_reg_cert_img)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    const mentorInsertValues = [
      userId,
      experience,
      degree,
      medical_lic_num,
      pancard_img,
      adharcard_front_img,
      adharcard_back_img,
      doctor_reg_cert_img,
    ];

    await db.query(mentorInsertQuery, mentorInsertValues);

    return res.status(201).json({
      success: true,
      message: "The Mentor registration was successful",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
*/

exports.registerMentor = async (req, res, formattedFileUrls) => {
  const { name, email, password, gender, address, mobile } = req.body;
  const { experience, degree, medical_lic_num } = req.body;

  try {
    // Hash the password before storing it
    const hashedPassword = await hash(password, 10);
    const pancard_img = formattedFileUrls.pancard_img[0].downloadURL;
    const adharcard_front_img =
      formattedFileUrls.adharcard_front_img[0].downloadURL;
    const adharcard_back_img =
      formattedFileUrls.adharcard_back_img[0].downloadURL;
    const doctor_reg_cert_img =
      formattedFileUrls.doctor_reg_cert_img[0].downloadURL;

    // Step 1: Insert data into the 'users' table
    const userInsertQuery = `
      INSERT INTO users(name, email, password, gender, address, mobile, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, email;
    `;

    const userInsertValues = [
      name,
      email,
      hashedPassword,
      gender,
      address,
      mobile,
      "mentor",
    ];

    const { rows } = await db.query(userInsertQuery, userInsertValues);

    // Retrieve the user_id and email generated during the insertion
    const userId = rows[0].user_id;
    const userEmail = rows[0].email;

    // Step 2: Insert data into the 'mentors' table
    const mentorInsertQuery = `
      INSERT INTO mentors(user_id, experience, degree, medical_lic_num, pancard_img, adharcard_front_img, adharcard_back_img, doctor_reg_cert_img)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
    `;

    const mentorInsertValues = [
      userId,
      experience,
      degree,
      medical_lic_num,
      pancard_img,
      adharcard_front_img,
      adharcard_back_img,
      doctor_reg_cert_img,
    ];

    await db.query(mentorInsertQuery, mentorInsertValues);

    // Log in the user automatically after successful registration
    req.user = { user_id: userId, email: userEmail };
    return exports.login(req, res);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Login

exports.login = async (req, res) => {
  let user = req.user;

  let payload = {
    id: user.user_id,
    email: user.email,
  };

  try {
    const token = await sign(payload, SECRET);

    return res.status(200).cookie("token", token, { httpOnly: true }).json({
      success: true,
      userId: payload.id,
      token: token,
      message: "Logged in succefully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.protected = async (req, res) => {
  try {
    return res.status(200).json({
      info: "protected info",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    return res.status(200).clearCookie("token", { httpOnly: true }).json({
      success: true,
      message: "Logged out succefully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update Profile
// firebase func For handling file duplicancy
async function deleteFileFromStorage(fileUrl) {
  try {
    const fileNameWithEncoding = fileUrl.split("/").pop().split("?")[0];
    const fileDecoded = decodeURIComponent(fileNameWithEncoding);
    const desertRef = ref(storage, fileDecoded);
    await deleteObject(desertRef);
    console.log("Deleted file from bucket");
  } catch (error) {
    if (error.code === "storage/object-not-found") {
      console.log("File does not exist in bucket:", fileUrl);
    } else {
      console.error("Error deleting file from bucket:", error.message);
      throw error;
    }
  }
}

/*
async function deleteFileFromStorage(fileUrl) {
  try {
    const fileNameWithEncoding = fileUrl.split("/").pop().split("?")[0];
    const fileDecoded = decodeURIComponent(fileNameWithEncoding);
    const desertRef = ref(storage, fileDecoded);
    await deleteObject(desertRef);
    console.log("Deleted file from bucket");
  } catch (error) {
    console.error("Error deleting file from bucket:", error.message);
    throw error;
  }
}
*/

// Update Mentee Profile
exports.updateMenteeProfile = async (req, res, formattedFileUrls) => {
  const { user_id } = req.params; // Assuming user_id is available in the request
  const { name, gender, dob, address, mobile, occupation } = req.body;

  try {
    const userInfoQuery = `
    SELECT  name, gender, address, mobile, profile_img
    FROM users
    WHERE user_id = $1;
  `;
    const userInfoResult = await db.query(userInfoQuery, [user_id]);
    const userInfo = userInfoResult.rows[0];

    const menteeInfoQuery = `
    SELECT  dob, occupation
    FROM mentees
    WHERE user_id = $1;
  `;
    const menteeInfoResult = await db.query(menteeInfoQuery, [user_id]);
    const menteeInfo = menteeInfoResult.rows[0];

    const myname = name || userInfo.name;
    const mygender = gender || userInfo.gender;
    const myaddress = address || userInfo.address;
    const mymobile = mobile || userInfo.mobile;
    const mydob = dob || menteeInfo.dob;
    const myoccupation = occupation || menteeInfo.occupation;

    const profile_img =
      formattedFileUrls.profile_img?.[0]?.downloadURL || userInfo.profile_img;
    if (formattedFileUrls.profile_img && userInfo.profile_img) {
      await deleteFileFromStorage(userInfo.profile_img);
    }
    // Update the user's basic information (excluding email)
    const updateUserQuery = `
      UPDATE users
      SET name = $1, gender = $2, address = $3, mobile = $4, profile_img = $5
      WHERE user_id = $6
      RETURNING *; -- Return all columns of the updated user
    `;
    const updateUserValues = [
      myname,
      mygender,
      myaddress,
      mymobile,
      profile_img,
      user_id,
    ];
    const updatedUserResult = await db.query(updateUserQuery, updateUserValues);
    const updatedUser = updatedUserResult.rows[0]; // Fetch the updated user details

    // Update the mentee-specific information
    const updateMenteeQuery = `
      UPDATE mentees
      SET occupation = $1 , dob = $2
      WHERE user_id = $3;
    `;
    const updateMenteeValues = [myoccupation, mydob, user_id];
    await db.query(updateMenteeQuery, updateMenteeValues);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentee profile updated successfully",
      // user: updatedUser, // Return the updated user details
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update Mentor Profile
exports.updateMentorProfile = async (req, res, formattedFileUrls) => {
  const { user_id } = req.params;
  const {
    name,
    gender,
    address,
    mobile,
    experience,
    degree,
    medical_lic_num,
  } = req.body;

  try {
    const dbQueries = [];

    // Fetch all mentor-specific information from the database
    const userInfoQuery = `
      SELECT name, gender, address, mobile, profile_img
      FROM users
      WHERE user_id = $1;
    `;
    const userInfoResult = await db.query(userInfoQuery, [user_id]);
    const userInfo = userInfoResult.rows[0];

    // Fetch All Mentor's Details
    const mentorInfoQuery = `
      SELECT experience, degree, medical_lic_num,pancard_img, adharcard_front_img, adharcard_back_img, doctor_reg_cert_img
      FROM mentors
      WHERE user_id = $1;
    `;
    const mentorInfoResult = await db.query(mentorInfoQuery, [user_id]);
    const mentorInfo = mentorInfoResult.rows[0];

    const myname = name || userInfo.name;
    const mygender = gender || userInfo.gender;
    const myaddress = address || userInfo.address;
    const mymobile = mobile || userInfo.mobile;
    const myexperience = experience || mentorInfo.experience;
    const mydegree = degree || mentorInfo.degree;
    const mymedical_lic_num = medical_lic_num || mentorInfo.medical_lic_num;

    // Check if formattedFileUrls is empty, if so, use previous values
    if (!formattedFileUrls) {
      console.log("Formatted file URLs are empty. Using previous values.");
      formattedFileUrls = {};
    }

    // Check if profile_img is uploaded, if not, use the previous value
    const profile_img =
      formattedFileUrls.profile_img?.[0]?.downloadURL || userInfo.profile_img;
    if (formattedFileUrls.profile_img && userInfo.profile_img) {
      await deleteFileFromStorage(userInfo.profile_img);
      // try {
      // } catch (error) {
      //   // Handle errors if needed
      //   console.error("Error deleting previous profile image:", error.message);
      // }
    }

    const pancard_img =
      formattedFileUrls.pancard_img?.[0]?.downloadURL || mentorInfo.pancard_img;
    if (formattedFileUrls.pancard_img && mentorInfo.pancard_img) {
      await deleteFileFromStorage(mentorInfo.pancard_img);
      // try {
      //   await deleteFileFromStorage(mentorInfo.pancard_img);
      // } catch (error) {
      //   // Handle errors if needed
      //   console.error("Error deleting previous pancard image:", error.message);
      // }
    }

    const adharcard_front_img =
      formattedFileUrls.adharcard_front_img?.[0]?.downloadURL ||
      mentorInfo.adharcard_front_img;
    if (
      formattedFileUrls.adharcard_front_img &&
      mentorInfo.adharcard_front_img
    ) {
      await deleteFileFromStorage(mentorInfo.adharcard_front_img);
      // try {
      //   await deleteFileFromStorage(mentorInfo.adharcard_front_img);
      // } catch (error) {
      //   // Handle errors if needed
      //   console.error(
      //     "Error deleting previous adharcard front image:",
      //     error.message
      //   );
      // }
    }

    const adharcard_back_img =
      formattedFileUrls.adharcard_back_img?.[0]?.downloadURL ||
      mentorInfo.adharcard_back_img;
    if (formattedFileUrls.adharcard_back_img && mentorInfo.adharcard_back_img) {
      await deleteFileFromStorage(mentorInfo.adharcard_back_img);
      // try {
      // } catch (error) {
      //   // Handle errors if needed
      //   console.error(
      //     "Error deleting previous adharcard back image:",
      //     error.message
      //   );
      // }
    }

    const doctor_reg_cert_img =
      formattedFileUrls.doctor_reg_cert_img?.[0]?.downloadURL ||
      mentorInfo.doctor_reg_cert_img;
    if (
      formattedFileUrls.doctor_reg_cert_img &&
      mentorInfo.doctor_reg_cert_img
    ) {
      await deleteFileFromStorage(mentorInfo.doctor_reg_cert_img);
      // try {
      // } catch (error) {
      //   // Handle errors if needed
      //   console.error(
      //     "Error deleting previous doctor reg cert image:",
      //     error.message
      //   );
      // }
    }

    // Update the user's basic information
    const updateUserQuery = `
      UPDATE users
      SET name = $1, gender = $2, address = $3, mobile = $4, profile_img = $5
      WHERE user_id = $6
      RETURNING *;
    `;
    const updateUserValues = [
      myname,
      mygender,
      myaddress,
      mymobile,
      profile_img,
      user_id,
    ];
    dbQueries.push(db.query(updateUserQuery, updateUserValues));

    // Update the mentor-specific information
    const updateMentorQuery = `
      UPDATE mentors
      SET experience = $1, degree = $2, medical_lic_num = $3, pancard_img = $4, adharcard_front_img = $5, adharcard_back_img = $6, doctor_reg_cert_img = $7
      WHERE user_id = $8;
    `;
    const updateMentorValues = [
      myexperience,
      mydegree,
      mymedical_lic_num,
      pancard_img,
      adharcard_front_img,
      adharcard_back_img,
      doctor_reg_cert_img,
      user_id,
    ];
    dbQueries.push(db.query(updateMentorQuery, updateMentorValues));

    // Execute all queries in parallel
    const results = await Promise.all(dbQueries);

    const updatedUser = results[0].rows[0]; // Fetch the updated user details

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentor profile updated successfully",
      // user: updatedUser, // Return the updated user details
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Without Del files during update profile

/*
exports.updateMentorProfile = async (req, res, formattedFileUrls) => {
  const { user_id } = req.params;
  const {
    name,
    gender,
    address,
    mobile,
    experience,
    degree,
    medical_lic_num,
  } = req.body;

  try {
    const dbQueries = [];

    // Fetch all mentor-specific information from the database
    const userInfoQuery = `
      SELECT profile_img
      FROM users
      WHERE user_id = $1;
    `;
    const userInfoResult = await db.query(userInfoQuery, [user_id]);
    const userInfo = userInfoResult.rows[0];

    // Fetch All Mentor's Details
    const mentorInfoQuery = `
      SELECT pancard_img, adharcard_front_img, adharcard_back_img, doctor_reg_cert_img
      FROM mentors
      WHERE user_id = $1;
    `;
    const mentorInfoResult = await db.query(mentorInfoQuery, [user_id]);
    const mentorInfo = mentorInfoResult.rows[0];

    // Check if formattedFileUrls is empty, if so, use previous values
    if (!formattedFileUrls) {
      console.log("Formatted file URLs are empty. Using previous values.");
      formattedFileUrls = {};
    }

    // Check if profile_img is uploaded, if not, use the previous value
    const profile_img = formattedFileUrls.profile_img?.[0]?.downloadURL;

    const pancard_img = formattedFileUrls.pancard_img?.[0]?.downloadURL;

    const adharcard_front_img =
      formattedFileUrls.adharcard_front_img?.[0]?.downloadURL;

    const adharcard_back_img =
      formattedFileUrls.adharcard_back_img?.[0]?.downloadURL;

    const doctor_reg_cert_img =
      formattedFileUrls.doctor_reg_cert_img?.[0]?.downloadURL;

    // Update the user's basic information
    const updateUserQuery = `
      UPDATE users
      SET name = $1, gender = $2, address = $3, mobile = $4, profile_img = $5
      WHERE user_id = $6
      RETURNING *;
    `;
    const updateUserValues = [
      name,
      gender,
      address,
      mobile,
      profile_img,
      user_id,
    ];
    dbQueries.push(db.query(updateUserQuery, updateUserValues));

    // Update the mentor-specific information
    const updateMentorQuery = `
      UPDATE mentors
      SET experience = $1, degree = $2, medical_lic_num = $3, pancard_img = $4, adharcard_front_img = $5, adharcard_back_img = $6, doctor_reg_cert_img = $7
      WHERE user_id = $8;
    `;
    const updateMentorValues = [
      experience,
      degree,
      medical_lic_num,
      pancard_img,
      adharcard_front_img,
      adharcard_back_img,
      doctor_reg_cert_img,
      user_id,
    ];
    dbQueries.push(db.query(updateMentorQuery, updateMentorValues));
    console.log("All Queries", updateMentorValues);

    // Execute all queries in parallel
    const results = await Promise.all(dbQueries);

    const updatedUser = results[0].rows[0]; // Fetch the updated user details

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentor profile updated successfully",
      // user: updatedUser, // Return the updated user details
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
*/
