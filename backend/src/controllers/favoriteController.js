const mongoose = require("mongoose");

const User = require("../models/User");
const Property = require("../models/Property");

const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property id",
      });
    }

    const property = await Property.findOne({
      _id: propertyId,
      isActive: true,
      isAvailable: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: "seeker",
      isActive: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Seeker account not found",
      });
    }

    const alreadyFavorite = user.favorites.some(
      (favoriteId) =>
        favoriteId.toString() === propertyId
    );

    if (alreadyFavorite) {
      user.favorites = user.favorites.filter(
        (favoriteId) =>
          favoriteId.toString() !== propertyId
      );

      await user.save();

      return res.status(200).json({
        success: true,
        isFavorite: false,
        message: "Property removed from favorites",
      });
    }

    user.favorites.push(propertyId);

    await user.save();

    return res.status(200).json({
      success: true,
      isFavorite: true,
      message: "Property added to favorites",
    });
  } catch (error) {
    console.error(
      "Toggle favorite error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update favorites",
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.userId,
      role: "seeker",
      isActive: true,
    }).populate({
      path: "favorites",
      match: {
        isActive: true,
        isAvailable: true,
      },
      populate: {
        path: "owner",
        select: "name phone email",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Seeker account not found",
      });
    }

    const favorites = user.favorites.filter(Boolean);

    return res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error(
      "Get favorites error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch favorites",
    });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
};