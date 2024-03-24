const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
// const {
//   classifyMessage,
// } = require("../controllers/messageClassification");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
// router.route("/classify").get(classifyMessage);

module.exports = router;
