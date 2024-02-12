const db = require("../../db.js");

// Save user answers in bulk for a quiz and calculate score
exports.saveUserAnswersBulk = async (req, res) => {
  const { userId, quizId, answers } = req.body;

  try {
    // Calculate the score as the sum of answer_int values
    let score = answers.reduce((acc, answer) => acc + answer.answer_int, 0);

    // Prepare the values array for bulk insert
    const values = answers.map((answer) => [
      userId,
      answer.questionId,
      answer.answer_int,
    ]);

    // Construct the SQL query for bulk insert
    const query = `
      INSERT INTO UserAnswers (user_id, question_id, answer_int)
      VALUES ${values
        .map(
          (_, index) =>
            `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
        )
        .join(",")}
      RETURNING *;
    `;

    // Execute the bulk insert query
    const { rows } = await db.query(query, values.flat());

    // Insert the calculated score into UserScores table
    const scoreQuery = `
      INSERT INTO UserScores (user_id, quiz_id, score)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    // Execute the score insertion query
    const {
      rows: [insertedScore],
    } = await db.query(scoreQuery, [userId, quizId, score]);

    return res.status(201).json({
      success: true,
      data: { insertedAnswers: rows, insertedScore },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};
