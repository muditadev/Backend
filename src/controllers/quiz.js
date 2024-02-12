const db = require("../../db.js");

// Create a new quiz
exports.createQuiz = async (req, res) => {
  const { title, description, creator_id } = req.body;

  try {
    const query = `
      INSERT INTO Quizzes (title, description, creator_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const { rows } = await db.query(query, [title, description, creator_id]);

    const createdQuiz = rows[0];
    return res.status(201).json({
      success: true,
      data: createdQuiz,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const query = "SELECT * FROM Quizzes";
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

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  const quizId = req.params.id;

  try {
    const query = "SELECT * FROM Quizzes WHERE quiz_id = $1";
    const { rows } = await db.query(query, [quizId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    const quiz = rows[0];
    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Update quiz by ID
exports.updateQuizById = async (req, res) => {
  const quizId = req.params.id;
  const { title, description } = req.body;

  try {
    const query = `
      UPDATE Quizzes
      SET title = $1, description = $2
      WHERE quiz_id = $3
      RETURNING *;
    `;

    const { rows } = await db.query(query, [title, description, quizId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    const updatedQuiz = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete quiz by ID
exports.deleteQuizById = async (req, res) => {
  const quizId = req.params.id;

  try {
    const query = "DELETE FROM Quizzes WHERE quiz_id = $1 RETURNING *";
    const { rows } = await db.query(query, [quizId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    const deletedQuiz = rows[0];
    return res.status(200).json({
      success: true,
      is_deleted: "successfully Deleted !",
      data: deletedQuiz,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
