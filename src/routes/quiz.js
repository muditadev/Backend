const { Router } = require("express");
const {
  createQuiz,
  getQuizById,
  getAllQuizzes,
  updateQuizById,
  deleteQuizById,
} = require("../controllers/quiz");

const router = Router();

router.post("/create", createQuiz);
router.post("/update/:id", updateQuizById);
router.get("/getbyId/:id", getQuizById);
router.get("/getAll", getAllQuizzes);
router.delete("/delete/:id", deleteQuizById);

module.exports = router;
