class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // fail (client-side) e error (server-side).
    this.isOperational = true; //errore che è previsto e gestito nell'applicazione
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor); //Cattura la traccia dello stack per il debugging, migliorando la visibilità degli errori.
  }
}

module.exports = AppError;
