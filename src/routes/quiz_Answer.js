const { Router } = require("express");
const {
  saveUserAnswersBulk,
  getUserScoresForQuiz,
} = require("../controllers/quiz_Answer");

const router = Router();

router.post("/save", saveUserAnswersBulk);
router.get("/score/user/:userId/quiz/:quizId", getUserScoresForQuiz);

module.exports = router;
