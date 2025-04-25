const cron = require("node-cron");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const winston = require("winston");

dotenv.config();
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("🔄 Cronjob deactivated users 🔌 Database connected... ✅");
  })
  .catch((err) => {
    console.log("❌ Cronjob Database connection error:", err.message);
  });

// Configura il logger di Winston
const logger = winston.createLogger({
  level: "info", // Il livello dei log che raccogliamo
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colora i log sulla console
        winston.format.simple() // Format semplice
      ),
    }),
    new winston.transports.File({
      filename: "./cronjob.log", // Scrive in un file chiamato 'cronjob.log'
      level: "info", // Scriviamo solo log a partire dal livello 'info'
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Formato JSON con timestamp
      ),
    }),
  ],
});

// Cron job per eliminare utenti disattivati da più di 30 giorni
cron.schedule("0 0 * * *", async () => {
  logger.info("🔄 Checking for deactivated users...");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Cerchiamo di eliminare gli utenti disattivati da più di 30 giorni
    const result = await User.deleteMany({
      isActive: false,
      deactivatedAt: { $lt: thirtyDaysAgo },
    });

    // Loggare il risultato
    logger.info(
      `🗑️ Deleted ${result.deletedCount} users deactivated for more than 30 days`
    );
  } catch (error) {
    // Loggare l'errore in caso di fallimento
    logger.error("❌ Error deleting users: ", error.message);
  }
});
