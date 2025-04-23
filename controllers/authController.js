const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const emailMessage = require("../utils/emailMessages");
const crypto = require("crypto");
const ms = require("ms");

const signToken = (id, duration) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: duration,
  });

const createSendToken = (user, status, res, duration) => {
  const {
    name,
    email,
    role,
    isVerified,
    isActive,
    profileImage,
    lastLogin,
    createdAt,
    updatedAt,
    avatar,
  } = user;

  const token = signToken(user._id, duration);

  const cookieOptions = {
    expires: new Date(Date.now() + ms(duration)),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(200).json({
    status: "success",
    user: {
      name,
      email,
      role,
      isVerified,
      isActive,
      profileImage,
      lastLogin,
      createdAt,
      updatedAt,
      avatar,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, surname, email, password, passwordConfirm, address } = req.body;
  const { street, houseNumber, city, postalCode, doorbell } = address;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.deactivatedAt !== null) {
      return res.status(200).json({
        status: "inactive",
        message: "Hai già un account disattivato. Vuoi riattivarlo?",
        email: existingUser.email,
      });
    } else {
      return next(new AppError("Email già in uso", 400));
    }
  }

  // if (existingUser) {
  //   if (!existingUser.isActive && existingUser.lastLogin !== null) {
  //     existingUser.password = password;
  //     existingUser.passwordConfirm = passwordConfirm;
  //     await existingUser.save({ validateBeforeSave: false });

  //     const verificationToken = signToken(existingUser._id, "1h");
  //     const verificationUrl = `${req.protocol}://${req.get(
  //       "host"
  //     )}/v1/auth/verify?token=${verificationToken}`;

  //     await sendEmail({
  //       email: existingUser.email,
  //       subject: "Confirm the reactivation of your account.",
  //       html: emailMessage.messageExistingUser(
  //         existingUser.name,
  //         verificationUrl
  //       ),
  //     });

  //     return res.status(200).json({
  //       status: "success",
  //       message:
  //         "Your account has been reactivated! Check your email to confirm.",
  //     });
  //   }

  //   return next(new AppError("Email already in use!", 400));
  // }

  const newUser = await User.create({
    name,
    surname,
    email,
    password,
    passwordConfirm,
    address: {
      street,
      houseNumber,
      city,
      postalCode,
      doorbell,
    },
  });

  const verificationToken = signToken(newUser._id, "1h");
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/v1/auth/verify?token=${verificationToken}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Confirm the activation of your account.",
      html: emailMessage.messageNewUser(newUser.name, verificationUrl),
    });

    res.status(200).json({
      status: "success",
      message:
        "Signup successful. Please check your email to verify your account.",
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError("There was an error sending emial try again later!"),
      500
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError("Missing token", 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 400));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User not found", 400));
  }

  if (user.isVerified) {
    return next(new AppError("Email already verified!", 400));
  }

  user.isVerified = true;
  user.isActive = true;
  user.deactivatedAt = null;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: user,
  });

  // res.redirect(`${process.env.FRONTEND_URL}/auth-app-frontend/signin`);
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

  if (!user.isActive) {
    return res.status(400).json({
      status: "failed",
      message: "Please verify yor email adress",
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 201, res, "7d");
});

exports.logout = catchAsync(async (req, res, next) => {
  // const token = req.cookies.jwt; // Prendi il token dal cookie

  // if (token) {
  //   try {
  //     const decoded = jwt.decode(token);
  //     const expiration = new Date(decoded.exp * 1000);

  //     await Blacklist.create({ token: token, expiresAt: expiration });
  //   } catch (error) {
  //     console.error("Errore decodifica JWT:", error);
  //   }
  // }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.status(200).json({ status: "success", message: "You are logged out" });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  console.log(req.cookies);
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Prima devi fare login", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  const freshUser = await User.findById(decoded.id);
  console.log(freshUser);
  if (!freshUser || !freshUser.isActive) {
    return next(
      new AppError("Utente di questo token non esiste piu o e deattivato", 401)
    );
  }

  console.log(freshUser.changesPasswordAfter(decoded.iat));

  if (freshUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "Utente ha cambiato passsord di recente efrttuare login",
        401
      )
    );
  }
  req.user = freshUser;
  next();
});

exports.rsstricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return new AppError("Non hai permesso per fare questo", 403);
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    next(new AppError("Per favore, fornisci la tua email.", 404));
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Utente con questo e-mail non esiste", 404));
  }

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/forgotPassword/${resetToken}`;

  const message = `Hai dimenticato la password? ${resetURL}`;

  await sendEmail({
    email: user.email,
    subject: "reset token",
    message: message,
  });

  res.status(200).json({
    status: "success",
    message: "Token via mail",
    resetURL: resetURL,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token invalido o scaduto", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  if (await user.correctPassword(req.body.passwordNew, user.password)) {
    return next(
      new AppError("Your new password must be different from the old one", 400)
    );
  }

  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  const token = signToken(user.id);

  res.status(200).json({
    status: "success",
    token,
  });
});

// exports.reactivateUser = catchAsync(async (req, res, next) =>{
//   const userToReactive = User.
// })
