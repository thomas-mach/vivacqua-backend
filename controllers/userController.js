// const multer = require("multer");
const User = require("../models/userModel");
const Blacklist = require("../models/blacklistModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const filterObj = require("../utils/filterObj");
const sendEmail = require("../utils/email");
const emailMessage = require("../utils/emailMessages");
const jwt = require("jsonwebtoken");

const signToken = (id, duration) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: duration,
  });

exports.softDeleteUser = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  const user = await User.findByIdAndUpdate(
    req.user.id, //viene preso dal middleware di autenticazione
    { isActive: false, deactivatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    next(new AppError("Utente non trovato", 404));
  }

  if (token) {
    try {
      const decoded = jwt.decode(token);
      const expiration = new Date(decoded.exp * 1000);
      await Blacklist.create({ token: token, expiresAt: expiration });
    } catch (error) {
      console.error("Errore decodifica JWT:", error);
    }
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

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const filteredBody = filterObj(
    req.body,
    "name",
    "surname",
    "address",
    "email"
  );
  const previousEmail = user.email;

  if (filteredBody.address) {
    filteredBody.address = {
      ...user.address.toObject(), // converti Mongoose doc in oggetto normale
      ...filteredBody.address,
    };
  }

  if (filteredBody.email && filteredBody.email !== user.email) {
    filteredBody.isVerified = false;
  }

  // Applica modifiche e salva
  user.set(filteredBody);
  await user.save({ validateModifiedOnly: true });

  // ✉️ Invia l’email di verifica dopo il salvataggio
  if (filteredBody.email && filteredBody.email !== previousEmail) {
    try {
      const verificationToken = signToken(user._id, "1h");
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/v1/auth/verify?token=${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: "Conferma la tua nuova email.",
        html: emailMessage.messageNewUser(user.name, verificationUrl),
      });

      return res.status(200).json({
        status: "success",
        message: "Email di conferma inviata.",
        data: {
          user,
        },
      });
    } catch (err) {
      return next(
        new AppError(
          "Si è verificato un errore nell'invio della email, prova più tardi"
        ),
        500
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
