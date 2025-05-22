const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");
const authController = require("../controllers/authController");

router.post(
  "/payment-intent",
  authController.protect,
  stripeController.createPaymentIntent
);

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   stripeController.handleWebhook
// );

module.exports = router;
