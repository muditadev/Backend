const db = require("../../db.js");

// Create a new banner
exports.createBanner = async (req, res, formattedFileUrls) => {
  const { title, subtitle, link } = req.body;

  try {
    const query = `
      INSERT INTO Banner (title, subtitle, link, cover_img)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const cover_img = formattedFileUrls.cover_img[0].downloadURL;

    const { rows } = await db.query(query, [title, subtitle, link, cover_img]);

    const createdBanner = rows[0];
    return res.status(201).json({
      success: true,
      data: createdBanner,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all banners with pagination
exports.getAllBanners = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM Banner";
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const query = "SELECT * FROM Banner LIMIT $1 OFFSET $2";
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

// Get a specific banner by ID
exports.getBannerById = async (req, res) => {
  const bannerId = req.params.id;

  try {
    const query = "SELECT * FROM Banner WHERE id = $1";
    const { rows } = await db.query(query, [bannerId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Banner not found",
      });
    }

    const banner = rows[0];
    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update a specific banner by ID
exports.updateBannerById = async (req, res, formattedFileUrls) => {
  const bannerId = req.params.id;
  const { title, subtitle, link } = req.body;

  try {
    const query = `
      UPDATE Banner
      SET title = $1, subtitle = $2, link = $3, cover_img = $4
      WHERE id = $5
      RETURNING *;
    `;
    const cover_img = formattedFileUrls.cover_img[0].downloadURL;

    const { rows } = await db.query(query, [
      title,
      subtitle,
      link,
      cover_img,
      bannerId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Banner not found",
      });
    }

    const updatedBanner = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedBanner,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete a specific banner by ID
exports.deleteBannerById = async (req, res) => {
  const bannerId = req.params.id;

  try {
    const query = "DELETE FROM Banner WHERE id = $1 RETURNING *";
    const { rows } = await db.query(query, [bannerId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Banner not found",
      });
    }

    const deletedBanner = rows[0];
    return res.status(200).json({
      success: true,
      is_deleted: "successfully Deleted !",
      data: deletedBanner,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
