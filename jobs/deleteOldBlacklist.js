const cron = require("node-cron");
const Blacklist = require("../models/blacklistModel");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const winston = require("winston");

dotenv.config();
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("🔄 Cronjob Blacklist 🔌 Database connected... ✅");
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
  logger.info("🔄 Checking for old blaclisted token...");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const result = await Blacklist.deleteMany({
      expiresAt: { $lt: sevenDaysAgo },
    });

    // Loggare il risultato
    logger.info(
      `🗑️ Deleted ${result.deletedCount} tokens expires for more than 7 days`
    );
  } catch (error) {
    // Loggare l'errore in caso di fallimento
    logger.error("❌ Error deleting users: ", error.message);
  }
});
