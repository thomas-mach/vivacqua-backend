const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: [true, "Street is required"],
      minlength: [3, "Street must be at least 3 characters"],
    },
    houseNumber: {
      type: String,
      required: [true, "House number is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      minlength: [2, "City must be at least 2 characters"],
    },
    postalCode: {
      type: Number,
      required: [true, "Postal code is required"],
      match: [/^\d{5}$/, "Postal code must be 5 digits"], // italiano, tipo "00100"
    },
    doorbell: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "The name is required"],
      minlength: [2, "Name must be at least 2 characters"],
    },
    surname: {
      type: String,
      required: [true, "The sur name is required"],
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "The email is required"],
      unique: true,
      trim: true,
      maxlength: [255, "Email is too long"],
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "The password is required"],
      minlength: [8, "Password must be at least 8 characters."],
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, "The password is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },

        message: "The passwords are not the same",
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
