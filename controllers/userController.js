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
      )}/api/v1/auth/verify?token=${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: "Conferma la tua nuova email.",
        html: emailMessage.messageNewUser(user.name, verificationUrl),
      });

      res.status(200).json({
        status: "success",
        message:
          "Hai cambiato email. Controlla la tua casella di posta per confermare.",
        data: {
          user,
        },
      });

      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
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

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const { name, surname, email, role, lastLogin, address } = user;
  const { street, houseNumber, city, postalCode, doorbell } = address;

  res.status(200).json({
    status: "success",
    user: {
      name,
      surname,
      email,
      role,
      lastLogin,
      street,
      houseNumber,
      city,
      postalCode,
      doorbell,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // 1. Costruisci filtro di base escludendo campi speciali
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "surname"];
  excludedFields.forEach((el) => delete queryObj[el]);

  // 2. Gestione ricerca per nome
  function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  if (req.query.surname) {
    const regex = new RegExp(escapeRegex(req.query.surname), "i");
    queryObj.surname = { $regex: regex };
  }

  // 3. Costruisci query base
  let query = User.find(queryObj).select("-password -__v");

  // 4. Ordinamento
  if (req.query.sort) {
    query = query.sort(req.query.sort); // es. 'name' o '-createdAt'
  } else {
    query = query.sort("-createdAt"); // default: più recenti
  }

  // 5. Paginazione
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // 6. Esegui query e conteggio totale filtrato
  const [users, totalUsers] = await Promise.all([
    query,
    User.countDocuments(queryObj),
  ]);

  // 7. Risposta
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      users,
    },
  });
});

exports.updateUserByAdmin = catchAsync(async (req, res, next) => {
  console.log("updateUserByAdmin()");
  console.log(req.body);
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("Utente non trovato", 404));

  const allowedFields = [
    "name",
    "surname",
    "email",
    "address",
    "role",
    "isActive",
    "deactivateAt",
  ];

  const filteredBody = filterObj(req.body, ...allowedFields);

  const previousEmail = user.email;

  if (filteredBody.address) {
    filteredBody.address = {
      ...user.address.toObject(),
      ...filteredBody.address,
    };
  }

  if (filteredBody.email && filteredBody.email !== user.email) {
    filteredBody.isVerified = false;

    // Invia email di verifica, se vuoi mantenerlo anche lato admin
    try {
      const verificationToken = signToken(user._id, "1h");
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify?token=${verificationToken}`;

      await sendEmail({
        email: filteredBody.email,
        subject: "Conferma la tua nuova email",
        html: emailMessage.messageNewUser(user.name, verificationUrl),
      });
    } catch (err) {
      return next(
        new AppError(
          "Errore nell'invio dell’email di verifica, riprova più tardi."
        )
      );
    }
  }

  console.log(filteredBody);
  user.set(filteredBody);
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
