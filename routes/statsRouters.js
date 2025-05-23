const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/", statsController.dailyRevenue);

module.exports = router;
