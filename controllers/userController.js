// const multer = require("multer");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// const filterObj = require("../utils/filterObj");

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id, //viene preso dal middleware di autenticazione
    { isActive: false, isVerified: false, deactivatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    next(new AppError("Utente non trovato", 404));
  }

  //   await Comment.deleteMany({ author: req.user.id });
  //   await Message.deleteMany({ sender: req.user.id });

  // Disconnetti l'utente cancellando il cookie JWT
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Your account has been successfully deactivated!",
  });
});
