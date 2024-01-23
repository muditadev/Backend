const { Router } = require("express");
const {
  registerMentor,
  login,
  protected,
  logout,
  registerMentee,
  getAllMentees,
  getAllMentors,
  getMentorById,
  getMenteeById,
} = require("../controllers/auth");
const {
  validationMiddleware,
} = require("../middlewares/validations-middleware");
const { registerValidation, loginValidation } = require("../validators/auth");
const { userAuth } = require("../middlewares/auth-middleware");
const router = Router();

router.get("/getallMentees", getAllMentees);
router.get("/getallMentors", getAllMentors);
router.get("/getMentors/:user_id", getMentorById);
router.get("/getMentees/:user_id", getMenteeById);
router.get("/protected", userAuth, protected);
router.post(
  "/registerMentee",
  registerValidation,
  validationMiddleware,
  registerMentee
);
router.post(
  "/registerMentor",
  registerValidation,
  validationMiddleware,
  registerMentor
);
router.post("/login", loginValidation, validationMiddleware, login);
router.get("/logout", logout);

module.exports = router;
