const User = require("../models/userModel");
const Blacklist = require("../models/blacklistModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const crypto = require("crypto");
const ms = require("ms");
const EmailService = require("../utils/EmailService");

const emailService = new EmailService();

const signToken = (id, duration) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: duration,
  });

const createSendToken = (user, status, res, duration) => {
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
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, surname, email, password, passwordConfirm, address } = req.body;
  const { street, houseNumber, city, postalCode, doorbell } = address;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isActive) {
      return next(
        new AppError("Utente disattivato", 404, null, "ACCOUNT_DISABLED")
      );
    } else {
      return next(new AppError("Email già in uso", 400));
    }
  }

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

  const verificationToken = signToken(newUser._id, "10m");
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify?token=${verificationToken}`;

  try {
    await emailService.sendVerificationEmail(newUser, verificationUrl, true);
    const { name, email } = newUser;
    res.status(200).json({
      status: "success",
      data: {
        name,
        email,
      },
      message:
        "Registrazione avvenuta con successo. Controlla la tua email per verificare l'account.",
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError(
        "Si è verificato un errore durante l'invio dell'email di verifica. La registrazione è stata annullata. Riprova più tardi.",
        500
      )
    );
  }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return next(new AppError("Token mancante", 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Token non valido o scaduto", 400));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("Utente non trovato", 400));
  }

  if (user.isVerified && user.isActive) {
    return next(new AppError("Email già verificata!", 400));
  }

  user.isVerified = true;
  user.isActive = true;
  user.deactivatedAt = null;
  user.lastLogin = Date.now();

  await user.save({ validateBeforeSave: false });

  const { name, email, isActive, isVerified } = user;

  createSendToken(user, 201, res, "7d");

  if (process.env.NODE_ENV === "development") {
    console.log("NODE_ENV:", process.env.NODE_ENV);
    res.redirect("http://localhost:5173/auto-login");
  } else {
    res.redirect(
      "https://thomas-mach.github.io/vivacqua-frontend/#/auto-login"
    );
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Fornisci email e password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Email o password non valide", 401));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Email o password non valide", 401));
  }

  if (!user.isActive) {
    return next(
      new AppError("Utente disattivato", 404, null, "ACCOUNT_DISABLED")
    );
  }

  if (!user.isVerified) {
    const { name, email, isVerified, isActive } = user;
    return res.status(400).json({
      status: "failed",
      message: "Per favore verifica il tuo indirizzo email",
      data: {
        name,
        isVerified,
      },
    });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 201, res, "7d");
  const { name, surname, isActive, isVerified, lastLogin, address } = user;
  const { street, houseNumber, city, postalCode, doorbell } = address;

  res.status(200).json({
    status: "success",
    user: {
      name,
      surname,
      email,
      isActive,
      isVerified,
      lastLogin,
      street,
      houseNumber,
      city,
      postalCode,
      doorbell,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt; // Prende il token dal cookie

  if (token) {
    try {
      const decoded = jwt.decode(token);
      const expiration = new Date(decoded.exp * 1000);
      await Blacklist.create({ token: token, expiresAt: expiration });
    } catch (error) {
      console.error("Errore decodifica JWT:", error);
    }
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.status(200).json({ status: "success", message: "Logout effettuato" });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  console.log("Token from protect", token);
  if (
    !token ||
    token === "null" ||
    token === "undefined" ||
    typeof token !== "string" ||
    token.trim().split(".").length !== 3 //controlla se token e HEADER.PAYLOAD.SIGNATURE
  ) {
    return next(new AppError("Effettua prima il login", 401));
  }

  const blacklistedToken = await Blacklist.findOne({ token });
  if (blacklistedToken) {
    return next(new AppError("Token non valido. Sei stato disconnesso", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decoded.id);

  if (!freshUser || !freshUser.isActive) {
    return next(
      new AppError("Utente di questo token non esiste più o è disattivato", 401)
    );
  }

  if (freshUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "L'utente ha recentemente cambiato password. Effettua di nuovo il login.",
        401
      )
    );
  }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Non hai i permessi per fare questo", 403));
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
    return next(new AppError("Utente con questa email non esiste", 404));
  }

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  let resetURL = ``;
  if (process.env.NODE_ENV === "development") {
    resetURL = `http://localhost:5173/reset-password?token=${resetToken}`;
  } else if (process.env.NODE_ENV === "production") {
    resetURL = `https://thomas-mach.github.io/vivacqua-frontend/#/reset-password?token=${resetToken}`;
  }

  try {
    await emailService.sendResetPasswordEmail(user, resetURL);

    res.status(200).json({
      status: "success",
      message: "Email per il reset della password inviata",
    });
  } catch (err) {
    return next(
      new AppError("Errore durante l'invio dell'email. Riprova più tardi!", 500)
    );
  }
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
    return next(new AppError("Token non valido o scaduto", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Nuova password impostata. Effettua il login.",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError("La password attuale non è corretta", 401));
  }

  if (await user.correctPassword(req.body.passwordNew, user.password)) {
    return next(
      new AppError(
        "La nuova password deve essere diversa da quella attuale",
        400
      )
    );
  }

  user.password = req.body.passwordNew;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.decode(token);
      const expiration = new Date(decoded.exp * 1000);
      await Blacklist.create({ token: token, expiresAt: expiration });
    } catch (error) {
      console.error("Errore decodifica JWT:", error);
    }
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.status(200).json({
    status: "success",
    message:
      "Password aggiornata con successo. Per motivi di sicurezza, effettua di nuovo il login.",
  });
});

exports.reactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new AppError("Utente non trovato", 404));
  }

  if (user.isActive) {
    next(new AppError("Utente già attivo", 404));
  }

  const verificationToken = signToken(user._id, "10m");
  const verificationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verify?token=${verificationToken}`;

  try {
    await emailService.sendVerificationEmail(user, verificationUrl, false);
    res.status(200).json({
      status: "success",
      message: "Controlla la tua email per riattivare l'account",
    });
  } catch (err) {
    return next(
      new AppError("Errore durante l'invio dell'email. Riprova più tardi!", 500)
    );
  }
});
