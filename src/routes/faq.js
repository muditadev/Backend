const { Router } = require("express");
const {
  createFAQ,
  updateFAQById,
  getFAQById,
  getAllFAQ,
  deleteFAQById,
} = require("../controllers/faq");

const router = Router();

router.post("/create", createFAQ);
router.post("/update/:id", updateFAQById);
router.get("/getbyId/:id", getFAQById);
router.get("/getAll", getAllFAQ);
router.delete("/delete/:id", deleteFAQById);

module.exports = router;
