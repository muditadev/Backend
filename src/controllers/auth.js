const db = require("../../db.js");
const { hash } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { SECRET } = require("../constants");

// Get By Id Mentees

exports.getMenteeById = async (req, res) => {
  const userId = req.params.user_id; // Assuming user_id is passed as a parameter
  // console.log(req);

  try {
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, mentees.dob, mentees.occupation
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
      SELECT users.user_id, users.name, users.email, users.mobile, mentors.experience, mentors.degree, mentors.medical_lic_num,  mentors.pancard_img, mentors.adharcard_front_img, mentors.adharcard_back_img, mentors.doctor_reg_cert_img
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
      SELECT users.user_id, users.name, users.email, users.mobile, mentees.dob, mentees.occupation
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
      SELECT users.user_id, users.name, users.email, users.mobile, mentors.experience, mentors.degree, mentors.medical_lic_num, mentors.pancard_img, mentors.adharcard_front_img, mentors.adharcard_back_img, mentors.doctor_reg_cert_img
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

// Update Mentee Profile
exports.updateMenteeProfile = async (req, res, formattedFileUrls) => {
  const { user_id } = req.params; // Assuming user_id is available in the request
  const { name, gender, dob, address, mobile, occupation } = req.body;

  try {
    const profile_img = formattedFileUrls.profile_img[0].downloadURL;

    // Update the user's basic information (excluding email)
    const updateUserQuery = `
      UPDATE users
      SET name = $1, gender = $2, address = $3, mobile = $4, profile_img = $5
      WHERE user_id = $6
      RETURNING *; -- Return all columns of the updated user
    `;
    const updateUserValues = [
      name,
      gender,
      address,
      mobile,
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
    const updateMenteeValues = [occupation, dob, user_id];
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
  const { user_id } = req.params; // Assuming user_id is available in the request
  console.log(user_id);
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
    const pancard_img = formattedFileUrls.pancard_img[0].downloadURL;
    const profile_img = formattedFileUrls.profile_img[0].downloadURL;
    const adharcard_front_img =
      formattedFileUrls.adharcard_front_img[0].downloadURL;
    const adharcard_back_img =
      formattedFileUrls.adharcard_back_img[0].downloadURL;
    const doctor_reg_cert_img =
      formattedFileUrls.doctor_reg_cert_img[0].downloadURL;

    // Update the user's basic information
    const updateUserQuery = `
      UPDATE users
      SET name = $1, gender = $2, address = $3, mobile = $4,  profile_img = $5
      WHERE user_id = $6
      RETURNING *; -- Return all columns of the updated user
    `;
    const updateUserValues = [
      name,
      gender,
      address,
      mobile,
      profile_img,
      user_id,
    ];
    const updatedUserResult = await db.query(updateUserQuery, updateUserValues);
    const updatedUser = updatedUserResult.rows[0]; // Fetch the updated user details

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
    await db.query(updateMentorQuery, updateMentorValues);

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
