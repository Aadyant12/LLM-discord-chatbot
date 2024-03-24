const express = require("express");
const {
  classifyMessage,
} = require("../controllers/messageClassification");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(classifyMessage);

module.exports = router;
