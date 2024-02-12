const db = require("../../db.js");

// Create a new question
exports.createQuestion = async (req, res) => {
  const { quiz_id, question_text } = req.body;

  try {
    const query = `
      INSERT INTO Questions (quiz_id, question_text)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const { rows } = await db.query(query, [quiz_id, question_text]);

    const createdQuestion = rows[0];
    return res.status(201).json({
      success: true,
      data: createdQuestion,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Get all questions for a quiz
exports.getAllQuestionsForQuiz = async (req, res) => {
  const quizId = req.params.quizId;

  try {
    const query = "SELECT * FROM Questions WHERE quiz_id = $1";
    const { rows } = await db.query(query, [quizId]);
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

// Update question by ID
exports.updateQuestionById = async (req, res) => {
  const questionId = req.params.id;
  const { questionText } = req.body;

  try {
    const query = `
      UPDATE Questions
      SET question_text = $1
      WHERE question_id = $2
      RETURNING *;
    `;

    const { rows } = await db.query(query, [questionText, questionId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const updatedQuestion = rows[0];
    return res.status(200).json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Delete question by ID
exports.deleteQuestionById = async (req, res) => {
  const questionId = req.params.id;

  try {
    const query = "DELETE FROM Questions WHERE question_id = $1 RETURNING *";
    const { rows } = await db.query(query, [questionId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const deletedQuestion = rows[0];
    return res.status(200).json({
      success: true,
      data: deletedQuestion,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
