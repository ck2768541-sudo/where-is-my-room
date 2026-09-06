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

      // Hotel fields
      acAvailable,
      acPricePerDay,
      nonAcAvailable,
      nonAcPricePerDay,

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

    /*
    |--------------------------------------------------------------------------
    | COMMON REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !title ||
      !propertyType ||
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

    /*
    |--------------------------------------------------------------------------
    | HOTEL VALIDATION
    |--------------------------------------------------------------------------
    */

    if (propertyType === "hotel") {
      if (acAvailable !== true && nonAcAvailable !== true) {
        return res.status(400).json({
          success: false,
          message:
            "At least AC or Non-AC must be available for hotel",
        });
      }

      if (acAvailable === true) {
        if (
          acPricePerDay === undefined ||
          acPricePerDay === null ||
          acPricePerDay === "" ||
          !Number.isFinite(Number(acPricePerDay)) ||
          Number(acPricePerDay) < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter valid AC per-day price",
          });
        }
      }

      if (nonAcAvailable === true) {
        if (
          nonAcPricePerDay === undefined ||
          nonAcPricePerDay === null ||
          nonAcPricePerDay === "" ||
          !Number.isFinite(Number(nonAcPricePerDay)) ||
          Number(nonAcPricePerDay) < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter valid Non-AC per-day price",
          });
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | ROOM / PG / FLAT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (propertyType !== "hotel") {
      if (
        monthlyRent === undefined ||
        !availableFor
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill all required property fields",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | PROPERTY DATA
    |--------------------------------------------------------------------------
    */

    const propertyData = {
      owner: ownerId,

      title: title.trim(),

      description:
        description?.trim() || "",

      propertyType,

      /*
       * Existing Room / PG / Flat monthly rent remains unchanged.
       *
       * Hotel keeps monthlyRent 0 because the existing schema
       * requires monthlyRent.
       */
      monthlyRent:
        propertyType === "hotel"
          ? 0
          : monthlyRent,

      securityDeposit:
        propertyType === "hotel"
          ? 0
          : securityDeposit || 0,

      availableFor:
        propertyType === "hotel"
          ? "anyone"
          : availableFor,

      furnishing:
        propertyType === "hotel"
          ? "unfurnished"
          : furnishing || "unfurnished",

      /*
       * Hotel-only fields
       */
      acAvailable:
        propertyType === "hotel"
          ? acAvailable === true
          : false,

      acPricePerDay:
        propertyType === "hotel" &&
        acAvailable === true
          ? Number(acPricePerDay)
          : null,

      nonAcAvailable:
        propertyType === "hotel"
          ? nonAcAvailable === true
          : false,

      nonAcPricePerDay:
        propertyType === "hotel" &&
        nonAcAvailable === true
          ? Number(nonAcPricePerDay)
          : null,

      address: address.trim(),

      locality: locality.trim(),

      city: city.trim(),

      state: state.trim(),

      pincode: pincode.trim(),

      amenities:
        Array.isArray(amenities)
          ? amenities
          : [],

      photos:
        Array.isArray(photos)
          ? photos
          : [],
    };

    /*
    |--------------------------------------------------------------------------
    | MAP LOCATION
    |--------------------------------------------------------------------------
    */

    if (
      typeof latitude === "number" &&
      typeof longitude === "number"
    ) {
      propertyData.location = {
        type: "Point",
        coordinates: [
          longitude,
          latitude,
        ],
      };
    }

    const property =
      await Property.create(propertyData);

    return res.status(201).json({
      success: true,
      message:
        propertyType === "hotel"
          ? "Hotel added successfully"
          : "Property created successfully",
      property,
    });
  } catch (error) {
    console.error(
      "Create property error:",
      error
    );

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
      filter.propertyType =
        propertyType;
    }

    /*
     * availableFor Hotel ke liye use nahi hoga.
     * Existing Room / PG / Flat filtering remains same.
     */
    if (
      availableFor &&
      propertyType !== "hotel"
    ) {
      filter.availableFor =
        availableFor;
    }

    /*
     * Existing minRent/maxRent filter preserve kiya gaya hai.
     *
     * Hotel ke liye AC ya Non-AC me jo option available hai,
     * uske per-day price par same filter apply hoga.
     */
    if (minRent || maxRent) {
      if (propertyType === "hotel") {
        const hotelPriceConditions = [];

        const acPriceCondition = {
          acAvailable: true,
          acPricePerDay: {},
        };

        if (minRent) {
          acPriceCondition.acPricePerDay.$gte =
            Number(minRent);
        }

        if (maxRent) {
          acPriceCondition.acPricePerDay.$lte =
            Number(maxRent);
        }

        hotelPriceConditions.push(
          acPriceCondition
        );

        const nonAcPriceCondition = {
          nonAcAvailable: true,
          nonAcPricePerDay: {},
        };

        if (minRent) {
          nonAcPriceCondition.nonAcPricePerDay.$gte =
            Number(minRent);
        }

        if (maxRent) {
          nonAcPriceCondition.nonAcPricePerDay.$lte =
            Number(maxRent);
        }

        hotelPriceConditions.push(
          nonAcPriceCondition
        );

        filter.$or =
          hotelPriceConditions;
      } else {
        filter.monthlyRent = {};

        if (minRent) {
          filter.monthlyRent.$gte =
            Number(minRent);
        }

        if (maxRent) {
          filter.monthlyRent.$lte =
            Number(maxRent);
        }
      }
    }

    const properties =
      await Property.find(filter)
        .populate(
          "owner",
          "name phone email"
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
      "Get properties error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch properties",
    });
  }
};

const getPropertyById = async (
  req,
  res
) => {
  try {
    const property =
      await Property.findOne({
        _id: req.params.id,
        isActive: true,
      }).populate(
        "owner",
        "name phone email"
      );

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
    console.error(
      "Get property details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch property details",
    });
  }
};

const getOwnerProperties = async (
  req,
  res
) => {
  try {
    const properties =
      await Property.find({
        owner: req.user.userId,
        isActive: true,
      }).sort({
        createdAt: -1,
      });

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
      message:
        "Unable to fetch owner properties",
    });
  }
};

const updatePropertyAvailability =
  async (req, res) => {
    try {
      const { isAvailable } = req.body;

      if (
        typeof isAvailable !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isAvailable must be true or false",
        });
      }

      const property =
        await Property.findOne({
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

      property.isAvailable =
        isAvailable;

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
        message:
          "Unable to update property availability",
      });
    }
  };

const updateProperty = async (
  req,
  res
) => {
  try {
    const property =
      await Property.findOne({
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

    /*
    |--------------------------------------------------------------------------
    | ALLOWED FIELDS
    |--------------------------------------------------------------------------
    */

    const allowedFields = [
      "title",
      "description",
      "propertyType",
      "monthlyRent",
      "securityDeposit",
      "availableFor",
      "furnishing",

      // Hotel fields
      "acAvailable",
      "acPricePerDay",
      "nonAcAvailable",
      "nonAcPricePerDay",

      "address",
      "locality",
      "city",
      "state",
      "pincode",
      "amenities",
      "photos",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          property[field] =
            req.body[field];
        }
      }
    );

    /*
    |--------------------------------------------------------------------------
    | HOTEL EDIT VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      property.propertyType ===
      "hotel"
    ) {
      if (
        property.acAvailable !== true &&
        property.nonAcAvailable !== true
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least AC or Non-AC must be available for hotel",
        });
      }

      if (property.acAvailable === true) {
        if (
          property.acPricePerDay ===
            undefined ||
          property.acPricePerDay ===
            null ||
          property.acPricePerDay ===
            "" ||
          !Number.isFinite(
            Number(property.acPricePerDay)
          ) ||
          Number(
            property.acPricePerDay
          ) < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter valid AC per-day price",
          });
        }

        property.acPricePerDay =
          Number(
            property.acPricePerDay
          );
      } else {
        property.acPricePerDay =
          null;
      }

      if (
        property.nonAcAvailable === true
      ) {
        if (
          property.nonAcPricePerDay ===
            undefined ||
          property.nonAcPricePerDay ===
            null ||
          property.nonAcPricePerDay ===
            "" ||
          !Number.isFinite(
            Number(
              property.nonAcPricePerDay
            )
          ) ||
          Number(
            property.nonAcPricePerDay
          ) < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter valid Non-AC per-day price",
          });
        }

        property.nonAcPricePerDay =
          Number(
            property.nonAcPricePerDay
          );
      } else {
        property.nonAcPricePerDay =
          null;
      }

      property.monthlyRent = 0;
      property.securityDeposit = 0;
      property.availableFor =
        "anyone";
      property.furnishing =
        "unfurnished";
    } else {
      /*
       * Property Hotel se Room / PG / Flat
       * banayi jaye to Hotel fields clear.
       */
      property.acAvailable = false;
      property.acPricePerDay = null;
      property.nonAcAvailable = false;
      property.nonAcPricePerDay = null;

      if (
        property.monthlyRent ===
          undefined ||
        property.monthlyRent ===
          null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Monthly rent is required",
        });
      }

      if (!property.availableFor) {
        return res.status(400).json({
          success: false,
          message:
            "Available for is required",
        });
      }
    }

    await property.save();

    return res.status(200).json({
      success: true,

      message:
        property.propertyType ===
        "hotel"
          ? "Hotel updated successfully"
          : "Property updated successfully",

      property,
    });
  } catch (error) {
    console.error(
      "Update property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update property",
    });
  }
};

const deleteProperty = async (
  req,
  res
) => {
  try {
    const property =
      await Property.findOne({
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
      message:
        "Property deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete property",
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