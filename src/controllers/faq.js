const db = require("../../db.js");

exports.createFAQ = async (req, res) => {
  const { question, answer } = req.body;

  try {
    const query = `
        INSERT INTO faq (question, answer)
        VALUES ($1, $2)
        RETURNING *;
      `;
    const { rows } = await db.query(query, [question, answer]);

    const createdFAQ = rows[0];
    return res.status(201).json({
      success: true,
      data: createdFAQ,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAllFAQ = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10 per page
  const offset = (page - 1) * limit;

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM faq";
    const totalCountResult = await db.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const query = "SELECT * FROM faq LIMIT $1 OFFSET $2";
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

exports.getFAQById = async (req, res) => {
  const faqId = req.params.id;

  try {
    const query = "SELECT * FROM faq WHERE faq_id = $1";
    const { rows } = await db.query(query, [faqId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "FAQ entry not found",
      });
    }

    const faq = rows[0];
    return res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.updateFAQById = async (req, res) => {
  const faqId = req.params.id;
  const { question, answer } = req.body;

  try {
    const query = `
        UPDATE faq
        SET question = $1, answer = $2
        WHERE faq_id = $3
        RETURNING *;
      `;

    const { rows } = await db.query(query, [question, answer, faqId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "FAQ entry not found",
      });
    }

    const updatedFAQ = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedFAQ,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.deleteFAQById = async (req, res) => {
  const faqId = req.params.id;

  try {
    const query = "DELETE FROM faq WHERE faq_id = $1 RETURNING *";
    const { rows } = await db.query(query, [faqId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "FAQ entry not found",
      });
    }

    const deletedFAQ = rows[0];
    return res.status(200).json({
      success: true,
      is_deleted: "successfully Deleted !",
      data: deletedFAQ,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
