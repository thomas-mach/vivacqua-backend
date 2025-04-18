const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    address: {
      street: req.body.address.street,
      houseNumber: req.body.address.houseNumber,
      city: req.body.address.city,
      postalCode: req.body.address.postalCode,
      doorbell: req.body.address.doorbell,
    },
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    token,
    status: "success",
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Fornire email e password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Utente con questo email non esiste", 400));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Email o password non valide", 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
