const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, "La via è obbligatoria"],
      minlength: [3, "La via deve contenere almeno 3 caratteri"],
    },
    houseNumber: {
      type: String,
      required: [true, "Il numero civico è obbligatorio"],
    },
    city: {
      type: String,
      required: [true, "La città è obbligatoria"],
      minlength: [2, "La città deve contenere almeno 2 caratteri"],
    },
    postalCode: {
      type: Number,
      required: [true, "Il CAP è obbligatorio"],
      match: [/^\d{5}$/, "Il CAP deve contenere 5 cifre"],
    },
    doorbell: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Il nome è obbligatorio"],
      minlength: [2, "Il nome deve contenere almeno 2 caratteri"],
    },
    surname: {
      type: String,
      required: [true, "Il cognome è obbligatorio"],
      minlength: [2, "Il cognome deve contenere almeno 2 caratteri"],
    },
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      unique: true,
      trim: true,
      maxlength: [255, "L'email è troppo lunga"],
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Inserisci un indirizzo email valido",
      },
    },
    password: {
      type: String,
      required: [true, "La password è obbligatoria"],
      minlength: [8, "La password deve contenere almeno 8 caratteri"],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, "La conferma della password è obbligatoria"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Le password non corrispondono",
      },
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    address: {
      type: addressSchema,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  console.log(
    "Password changed at:",
    new Date(this.passwordChangedAt).toLocaleString()
  );

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log("JWTtimestamp", this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
