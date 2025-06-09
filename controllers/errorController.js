const AppError = require("../utils/appError");

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Il valore '${value}' per il campo '${field}' è già in uso. Per favore, usa un valore diverso.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError("Validazione fallita", 400, errors);
};

const handleCastErrorDB = (err) => {
  const message = `Valore non valido per il campo '${err.path}': '${err.value}'`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Token non valido. Effettua nuovamente l'accesso!", 401);

const handleJWTExpiredError = () =>
  new AppError("Il token è scaduto! Effettua nuovamente l'accesso.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      error: err.errors,
      isOperational: err.isOperational,
    });
  } else {
    console.error("ERRORE 💥:", err);
    res.status(500).json({
      status: "error",
      message: "Qualcosa è andato storto!",
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log("NODE_ENV è:", process.env.NODE_ENV);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log("🔥 Errore ricevuto:", err.name);
  console.log("🧱 Contenuto completo:", err);

  if (process.env.NODE_ENV === "development") {
    if (err.name === "ValidationError") {
      const error = handleValidationErrorDB(err);
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        errors: error.errors,
      });
    }
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message, errors: err.errors };

    // let error = Object.create(err);
    // error.message = err.message;
    // error.errors = err.errors;

    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);

    sendErrorProd(error, res);
  }
};
