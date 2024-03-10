const express = require("express");
const app = express();
const { PORT, CLIENT_URL, SERVER_URL } = require("./src/constants/index");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");

//import passport middleware
require("./src/middlewares/passport-middleware");

//initialize middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [CLIENT_URL, SERVER_URL], credentials: true }));
app.use(passport.initialize());

//import routes
const authRoutes = require("./src/routes/auth");
const quizRoutes = require("./src/routes/quiz");
const questionRoutes = require("./src/routes/quiz_Question");
const answerRoutes = require("./src/routes/quiz_Answer");
const sosRoutes = require("./src/routes/sos");
const blogRoutes = require("./src/routes/blog");
const bannerRoutes = require("./src/routes/banner");
const socialRoutes = require("./src/routes/social_media");
const techniqueRoutes = require("./src/routes/technique");
const faqRoutes = require("./src/routes/faq");

//initialize routes
app.use("/api/v1", authRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/question", questionRoutes);
app.use("/api/v1/answer", answerRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/banner", bannerRoutes);
app.use("/api/v1/sos", sosRoutes);
app.use("/api/v1/social", socialRoutes);
app.use("/api/v1/technique", techniqueRoutes);
app.use("/api/v1/faq", faqRoutes);

//app start
const appStart = () => {
  try {
    app.listen(PORT, () => {
      console.log(`The app is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

appStart();
