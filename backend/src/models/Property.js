const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },

    coordinates: {
      type: [Number],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },

    propertyType: {
      type: String,
      enum: ["room", "pg", "flat"],
      required: true,
      index: true,
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableFor: {
      type: String,
      enum: ["anyone", "male", "female", "family"],
      required: true,
      index: true,
    },

    furnishing: {
      type: String,
      enum: [
        "furnished",
        "semi-furnished",
        "unfurnished",
      ],
      default: "unfurnished",
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    locality: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    // Map coordinates abhi optional rahenge.
    // Google Maps step me latitude/longitude add karenge.
    location: {
      type: locationSchema,
      default: undefined,
    },

    amenities: {
      type: [String],
      default: [],
    },

    photos: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({
  location: "2dsphere",
});

module.exports =
  mongoose.model("Property", propertySchema);