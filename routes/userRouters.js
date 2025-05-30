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

router.get(
  "/allUsers",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAllUsers
);

router.patch(
  "/updateUserByAdmin/:id",
  authController.protect,
  authController.restrictTo("admin"),
  userController.updateUserByAdmin
);

module.exports = router;
