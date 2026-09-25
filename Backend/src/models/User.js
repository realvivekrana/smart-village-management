const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // Basic Information
    // --------------------------------------------------

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid Indian phone number",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    // --------------------------------------------------
    // User Role
    // --------------------------------------------------

    role: {
      type: String,
      enum: {
        values: [
          "citizen",
          "business_owner",
          "admin",
          "super_admin",
        ],
        message: "Invalid user role",
      },
      default: "citizen",
    },

    // --------------------------------------------------
    // Profile
    // --------------------------------------------------

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------
    // Address
    // --------------------------------------------------

    address: {
      houseNumber: {
        type: String,
        trim: true,
        maxlength: 50,
      },

      street: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      village: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      district: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      pincode: {
        type: String,
        trim: true,
        match: [
          /^\d{6}$/,
          "Please enter a valid 6-digit pincode",
        ],
      },
    },

    // --------------------------------------------------
    // Account Status
    // --------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // --------------------------------------------------
    // Password Reset
    // --------------------------------------------------

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// ------------------------------------------------------
// Password Hashing
// ------------------------------------------------------
// Password database me plain text me store nahi hoga.
// Save hone se pehle bcrypt se hash hoga.

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

// ------------------------------------------------------
// Compare Password
// ------------------------------------------------------
// Login ke time entered password ko stored hash ke
// saath compare karega.

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ------------------------------------------------------
// Remove Sensitive Data
// ------------------------------------------------------
// Response me password return nahi hoga.

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;

  return user;
};

// ------------------------------------------------------
// Create Model
// ------------------------------------------------------

const User = mongoose.model("User", userSchema);

module.exports = User;