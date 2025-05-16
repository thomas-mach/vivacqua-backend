const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const AppError = require("../utils/appError");

// Configura storage multer (salva file originale prima di elaborazione)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

// Filtro: accetta solo immagini jpg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Solo file immagine jpg, png, webp sono ammessi!"), false);
  }
};

// Limite dimensione file 2MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, //5mb
});

// Middleware per ridimensionare e comprimere l'immagine caricata
const resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const inputPath = req.file.path; // file originale caricato da multer
    const ext = path.extname(req.file.filename);
    const outputFilename = `resized-${req.file.filename.split(ext)[0]}.webp`;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    await sharp(inputPath)
      .resize({ width: 800, height: 800, fit: "inside" }) // max 800x800 px
      .toFormat("webp")
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Elimina il file originale non elaborato
    fs.unlinkSync(inputPath);

    // Aggiorna i dati del file nella richiesta con il nuovo file ottimizzato
    req.file.filename = outputFilename;
    req.file.path = outputPath;
    req.file.mimetype = "image/webp";

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  resizeImage,
};
