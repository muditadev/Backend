const express = require("express");
const app = express();
const { PORT, CLIENT_URL } = require("./constants");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");

//import passport middleware
require("./middlewares/passport-middleware");

//initialize middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(passport.initialize());

//import routes
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const questionRoutes = require("./routes/quiz_Question");
const answerRoutes = require("./routes/quiz_Answer");
const sosRoutes = require("./routes/sos");
const blogRoutes = require("./routes/blog");
const bannerRoutes = require("./routes/banner");
const socialRoutes = require("./routes/social_media");
const techniqueRoutes = require("./routes/technique");
const faqRoutes = require("./routes/faq");

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
