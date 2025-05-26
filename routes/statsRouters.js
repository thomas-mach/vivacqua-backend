const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const authController = require("../controllers/authController");

router.use(authController.protect, authController.restrictTo("admin"));

router.get("/top-five", statsController.topFive);
router.get("/orders-state", statsController.ordersState);
router.get("/:range", statsController.revenue);

module.exports = router;
