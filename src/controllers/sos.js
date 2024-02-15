const db = require("../../db.js");

// Create a new SOS entry
exports.createSOS = async (req, res, formattedFileUrls) => {
  const { title, contact } = req.body;

  try {
    const query = `
      INSERT INTO SOS (title, video, contact)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const video = formattedFileUrls.video[0].downloadURL;

    const { rows } = await db.query(query, [title, video, contact]);

    const createdSOS = rows[0];
    return res.status(201).json({
      success: true,
      data: createdSOS,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all SOS entries with pagination
exports.getAllSOS = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM SOS";
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const query = "SELECT * FROM SOS LIMIT $1 OFFSET $2";
    const { rows } = await db.query(query, [limit, offset]);

    const response = {
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
      },
      data: rows,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get a specific SOS entry by ID
exports.getSOSById = async (req, res) => {
  const sosId = req.params.id;

  try {
    const query = "SELECT * FROM SOS WHERE id = $1";
    const { rows } = await db.query(query, [sosId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "SOS entry not found",
      });
    }

    const sos = rows[0];
    return res.status(200).json({
      success: true,
      data: sos,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update a specific SOS entry by ID
exports.updateSOSById = async (req, res, formattedFileUrls) => {
  const sosId = req.params.id;
  const { title, contact } = req.body;

  try {
    const query = `
      UPDATE SOS
      SET title = $1, video = $2, contact = $3
      WHERE id = $4
      RETURNING *;
    `;
    const video = formattedFileUrls.video[0].downloadURL;

    const { rows } = await db.query(query, [title, video, contact, sosId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "SOS entry not found",
      });
    }

    const updatedSOS = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedSOS,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete a specific SOS entry by ID
exports.deleteSOSById = async (req, res) => {
  const sosId = req.params.id;

  try {
    const query = "DELETE FROM SOS WHERE id = $1 RETURNING *";
    const { rows } = await db.query(query, [sosId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "SOS entry not found",
      });
    }

    const deletedSOS = rows[0];
    return res.status(200).json({
      success: true,
      is_deleted: "successfully Deleted !",
      data: deletedSOS,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
