const Property = require("../models/Property");

const createProperty = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const {
      title,
      description,
      propertyType,
      monthlyRent,
      securityDeposit,
      availableFor,
      furnishing,
      address,
      locality,
      city,
      state,
      pincode,
      amenities,
      photos,
      latitude,
      longitude,
    } = req.body;

    if (
      !title ||
      !propertyType ||
      monthlyRent === undefined ||
      !availableFor ||
      !address ||
      !locality ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required property fields",
      });
    }

    const propertyData = {
      owner: ownerId,
      title: title.trim(),
      description: description?.trim() || "",
      propertyType,
      monthlyRent,
      securityDeposit: securityDeposit || 0,
      availableFor,
      furnishing: furnishing || "unfurnished",
      address: address.trim(),
      locality: locality.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      amenities: Array.isArray(amenities) ? amenities : [],
      photos: Array.isArray(photos) ? photos : [],
    };

    if (
      typeof latitude === "number" &&
      typeof longitude === "number"
    ) {
      propertyData.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    const property = await Property.create(propertyData);

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create property",
    });
  }
};

const getProperties = async (req, res) => {
  try {
    const {
      city,
      locality,
      propertyType,
      availableFor,
      minRent,
      maxRent,
    } = req.query;

    const filter = {
      isActive: true,
      isAvailable: true,
    };

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (locality) {
      filter.locality = {
        $regex: locality,
        $options: "i",
      };
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (availableFor) {
      filter.availableFor = availableFor;
    }

    if (minRent || maxRent) {
      filter.monthlyRent = {};

      if (minRent) {
        filter.monthlyRent.$gte = Number(minRent);
      }

      if (maxRent) {
        filter.monthlyRent.$lte = Number(maxRent);
      }
    }

    const properties = await Property.find(filter)
      .populate("owner", "name phone email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(
      "Get properties error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch properties",
    });
  }
};


const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("owner", "name phone email");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    return res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Get property details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch property details",
    });
  }
};

const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      owner: req.user.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error(
      "Get owner properties error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch owner properties",
    });
  }
};

const updatePropertyAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.userId,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.isAvailable = isAvailable;

    await property.save();

    return res.status(200).json({
      success: true,
      message: isAvailable
        ? "Property marked as available"
        : "Property marked as occupied",
      property,
    });
  } catch (error) {
    console.error(
      "Update property availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update property availability",
    });
  }
};


const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.userId,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "propertyType",
      "monthlyRent",
      "securityDeposit",
      "availableFor",
      "furnishing",
      "address",
      "locality",
      "city",
      "state",
      "pincode",
      "amenities",
      "photos",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error(
      "Update property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update property",
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.userId,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    property.isActive = false;

    await property.save();

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete property",
    });
  }
};



module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getOwnerProperties,
  updatePropertyAvailability,
  updateProperty,
  deleteProperty,

};