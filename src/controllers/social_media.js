const db = require("../../db.js");

// Create a new social media entry
exports.createSocialMedia = async (req, res, formattedFileUrls) => {
  const { title, description, links } = req.body;

  try {
    const query = `
      INSERT INTO Social_Media (title, description, cover_img, links)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const cover_img = formattedFileUrls.cover_img[0].downloadURL;

    const { rows } = await db.query(query, [
      title,
      description,
      cover_img,
      links,
    ]);

    const createdSocialMedia = rows[0];
    return res.status(201).json({
      success: true,
      data: createdSocialMedia,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all social media entries with pagination
exports.getAllSocialMedia = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM Social_Media";
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const query = "SELECT * FROM Social_Media LIMIT $1 OFFSET $2";
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

// Get a specific social media entry by ID
exports.getSocialMediaById = async (req, res) => {
  const socialMediaId = req.params.id;

  try {
    const query = "SELECT * FROM Social_Media WHERE id = $1";
    const { rows } = await db.query(query, [socialMediaId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Social media entry not found",
      });
    }

    const socialMedia = rows[0];
    return res.status(200).json({
      success: true,
      data: socialMedia,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update a specific social media entry by ID
exports.updateSocialMediaById = async (req, res, formattedFileUrls) => {
  const socialMediaId = req.params.id;
  const { title, description, links } = req.body;

  try {
    const query = `
      UPDATE Social_Media
      SET title = $1, description = $2, cover_img = $3, links = $4
      WHERE id = $5
      RETURNING *;
    `;
    const cover_img = formattedFileUrls.cover_img[0].downloadURL;

    const { rows } = await db.query(query, [
      title,
      description,
      cover_img,
      links,
      socialMediaId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Social media entry not found",
      });
    }

    const updatedSocialMedia = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedSocialMedia,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete a specific social media entry by ID
exports.deleteSocialMediaById = async (req, res) => {
  const socialMediaId = req.params.id;

  try {
    const query = "DELETE FROM Social_Media WHERE id = $1 RETURNING *";
    const { rows } = await db.query(query, [socialMediaId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Social media entry not found",
      });
    }

    const deletedSocialMedia = rows[0];
    return res.status(200).json({
      success: true,
      is_deleted: "successfully Deleted !",
      data: deletedSocialMedia,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
