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

      validate: {
        validator: function (value) {
          if (!Array.isArray(value) || value.length !== 2) {
            return false;
          }

          const [longitude, latitude] = value;

          return (
            Number.isFinite(longitude) &&
            Number.isFinite(latitude) &&
            longitude >= -180 &&
            longitude <= 180 &&
            latitude >= -90 &&
            latitude <= 90
          );
        },

        message:
          "Coordinates must contain valid longitude and latitude values",
      },
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
      enum: ["room", "pg", "flat", "hotel"],
      required: true,
      index: true,
    },

    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
      max: 10000000,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000000,
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

    // HOTEL ONLY
    acAvailable: {
      type: Boolean,
      default: false,
    },

    acPricePerDay: {
      type: Number,
      min: 0,
      max: 1000000,
      default: null,
    },

    nonAcAvailable: {
      type: Boolean,
      default: false,
    },

    nonAcPricePerDay: {
      type: Number,
      min: 0,
      max: 1000000,
      default: null,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    locality: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,

      validate: {
        validator: function (value) {
          return /^[1-9][0-9]{5}$/.test(value);
        },

        message:
          "Please enter a valid 6-digit Indian pincode",
      },
    },

    location: {
      type: locationSchema,
      default: undefined,
    },

    amenities: {
      type: [String],
      default: [],

      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 30;
        },

        message:
          "Maximum 30 amenities are allowed",
      },
    },

    photos: {
      type: [String],
      default: [],

      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length <= 5;
        },

        message:
          "Maximum 5 property photos are allowed",
      },
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