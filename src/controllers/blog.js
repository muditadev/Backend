const db = require("../../db.js");

// Create a new blog post
exports.createBlog = async (req, res, formattedFileUrls) => {
  const { title, description } = req.body;

  try {
    const query = `
      INSERT INTO Blog (title, cover_img, description)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const cover_img = formattedFileUrls.cover_img[0].downloadURL;
    const { rows } = await db.query(query, [title, cover_img, description]);

    const createdBlog = rows[0];
    return res.status(201).json({
      success: true,
      data: createdBlog,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all blog posts with pagination
exports.getAllBlogs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM Blog";
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const query = "SELECT * FROM Blog LIMIT $1 OFFSET $2";
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

// Get blog post by ID
exports.getBlogById = async (req, res) => {
  const blogId = req.params.id;

  try {
    const query = "SELECT * FROM Blog WHERE id = $1";
    const { rows } = await db.query(query, [blogId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Blog post not found",
      });
    }

    const blog = rows[0];
    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update blog post by ID
exports.updateBlogById = async (req, res, formattedFileUrls) => {
  const blogId = req.params.id;
  const { title, description } = req.body;

  try {
    const query = `
      UPDATE Blog
      SET title = $1, cover_img = $2, description = $3
      WHERE id = $4
      RETURNING *;
    `;
    const cover_img = formattedFileUrls.cover_img[0].downloadURL;

    const { rows } = await db.query(query, [
      title,
      cover_img,
      description,
      blogId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Blog post not found",
      });
    }

    const updatedBlog = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedBlog,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete blog post by ID
exports.deleteBlogById = async (req, res) => {
  const blogId = req.params.id;

  try {
    const query = "DELETE FROM Blog WHERE id = $1 RETURNING *";
    const { rows } = await db.query(query, [blogId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Blog post not found",
      });
    }

    const deletedBlog = rows[0];
    return res.status(200).json({
      success: true,
      is_deleted: "successfully Deleted !",
      data: deletedBlog,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
