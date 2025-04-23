const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.get("/verify", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.delete(
  "/deleteMe",
  authController.protect,
  userController.softDeleteUser
);

router.get("/test", authController.protect, (req, res, next) => {
  res.status(200).json({
    message: "protect route",
  });
});

module.exports = router;
