const dotenv = require("dotenv"); // Per caricare variabili d'ambiente dal file .env
dotenv.config(); // Carica le variabili d'ambiente
const http = require("http"); // Importa il modulo HTTP per creare il server manualmente
const mongoose = require("mongoose"); // Per connettersi al database MongoDB
const app = require("./app"); // Importa l'app Express
const PORT = process.env.PORT || 3000;

// Gestione di errori NON catturati nel codice sincrono
process.on("uncaughtException", (err) => {
  console.log("💥💥💥", err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! 💥💥💥  Shuting down...");
  process.exit(1); // Termina l'app
});

const server = http.createServer(app); // Crea il server HTTP usando Express come gestore
require("./jobs/deleteOldUsers");
require("./jobs/deleteOldBlacklist");
// Connessione a MongoDB
mongoose.connect(process.env.DATABASE).then((con) => {
  console.log("🔌 Database connected... ✅");
});

// Avvio del server
const appServer = server.listen(PORT, () => {
  console.log(`📡 Server running on port ${PORT} ✅`);
});

// Gestione di promesse rifiutate non gestite
process.on("unhandledRejection", (err) => {
  console.log("💥💥💥", err.name, err.message);
  console.log("UNHENDLED REJECTION! 💥💥💥  Shuting down...");
  appServer.close(() => {
    process.exit(1); // Chiude il server in modo pulito prima di uscire
  });
});
