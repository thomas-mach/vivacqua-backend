const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.get("/verify", authController.verifyAccount);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.patch(
  "/deleteMe",
  authController.protect,
  userController.softDeleteUser
);

router.get("/getMe", authController.protect, userController.getMe);

router.patch("/updateMe", authController.protect, userController.updateMe);
router.post("/reactivate", authController.reactivateUser);

router.get("/test", authController.protect, (req, res, next) => {
  res.status(200).json({
    message: "protect route",
  });
});

// router.post("/create-payment-intent", authController.stripeTest);

module.exports = router;
