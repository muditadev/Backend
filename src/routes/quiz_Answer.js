const { Router } = require("express");
const { saveUserAnswersBulk } = require("../controllers/quiz_Answer");

const router = Router();

router.post("/save", saveUserAnswersBulk);

module.exports = router;
