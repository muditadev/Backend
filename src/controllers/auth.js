const db = require("../db");
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
      SELECT users.user_id, users.name, users.email, users.mobile, mentors.experience, mentors.degree, mentors.medical_lic_num
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

// Get ALL Mentees

exports.getAllMentees = async (req, res) => {
  try {
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, mentees.dob, mentees.occupation
      FROM users
      INNER JOIN mentees ON users.user_id = mentees.user_id
      WHERE users.role = 'mentee';
    `;

    const { rows } = await db.query(query);

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get ALL Mentors

exports.getAllMentors = async (req, res) => {
  try {
    const query = `
      SELECT users.user_id, users.name, users.email, users.mobile, mentors.experience, mentors.degree, mentors.medical_lic_num
      FROM users
      INNER JOIN mentors ON users.user_id = mentors.user_id
      WHERE users.role = 'mentor';
    `;

    const { rows } = await db.query(query);

    return res.status(200).json({
      success: true,
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

    // Step 2: Insert data into the 'mentees' table
    const menteeInsertQuery = `
      INSERT INTO mentees(user_id, dob, occupation)
      VALUES ($1, $2, $3);
    `;

    const menteeInsertValues = [userId, dob, occupation];

    await db.query(menteeInsertQuery, menteeInsertValues);

    return res.status(201).json({
      success: true,
      message: "The Mentees registration was successful",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Register Mentors

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
