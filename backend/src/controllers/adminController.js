const User = require("../models/User");
const Property = require("../models/Property");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSeekers,
      totalOwners,
      totalProperties,
      activeProperties,
      inactiveProperties,
    ] = await Promise.all([
      User.countDocuments({
        role: {
          $in: ["seeker", "owner"],
        },
      }),

      User.countDocuments({
        role: "seeker",
      }),

      User.countDocuments({
        role: "owner",
      }),

      Property.countDocuments({}),

      Property.countDocuments({
        isActive: true,
      }),

      Property.countDocuments({
        isActive: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSeekers,
        totalOwners,
        totalProperties,
        activeProperties,
        inactiveProperties,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard stats",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: {
        $in: ["seeker", "owner"],
      },
    })
      .select(
        "name email phone role seekerType isActive createdAt"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Admin get users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate(
        "owner",
        "name email phone"
      )
      .select(
        "title propertyType monthlyRent locality city isAvailable isActive createdAt owner"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(
      "Admin get properties error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch properties",
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: {
        $in: ["seeker", "owner"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Admin update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update user status",
    });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const property = await Property.findById(
      propertyId
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.isActive = isActive;

    await property.save();

    return res.status(200).json({
      success: true,

      message: isActive
        ? "Property activated successfully"
        : "Property deactivated successfully",

      property: {
        id: property._id,
        title: property.title,
        isActive: property.isActive,
        isAvailable: property.isAvailable,
      },
    });
  } catch (error) {
    console.error(
      "Admin update property status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update property status",
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getProperties,
  updateUserStatus,
  updatePropertyStatus,
};