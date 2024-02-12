const { Router } = require("express");
const {
  createQuestion,
  updateQuestionById,
  deleteQuestionById,
  getAllQuestionsForQuiz,
} = require("../controllers/quiz_Question");

const router = Router();

router.post("/create", createQuestion);
router.post("/update/:id", updateQuestionById);
router.get("/getAll/:quizId", getAllQuestionsForQuiz);
router.delete("/delete/:id", deleteQuestionById);

module.exports = router;
