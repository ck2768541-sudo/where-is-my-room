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
        message:
          "Please fill all required property fields",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | HOTEL VALIDATION
    |--------------------------------------------------------------------------
    */

    if (propertyType === "hotel") {
      if (
        acAvailable !== true &&
        nonAcAvailable !== true
      ) {
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
          !Number.isFinite(
            Number(acPricePerDay)
          ) ||
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
          nonAcPricePerDay ===
            undefined ||
          nonAcPricePerDay === null ||
          nonAcPricePerDay === "" ||
          !Number.isFinite(
            Number(nonAcPricePerDay)
          ) ||
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
          message:
            "Please fill all required property fields",
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

      /*
      |--------------------------------------------------------------------------
      | MODERATION
      |--------------------------------------------------------------------------
      */

      isVerified: false,

      moderationStatus:
        "pending",

      rejectionReason: "",
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
      await Property.create(
        propertyData
      );

    return res.status(201).json({
      success: true,

      message:
        propertyType === "hotel"
          ? "Hotel added and sent for review"
          : "Property created and sent for review",

      property,
    });
  } catch (error) {
    console.error(
      "Create property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create property",
    });
  }
};

const getProperties = async (
  req,
  res
) => {
  try {
    const {
      city,
      locality,
      propertyType,
      availableFor,
      minRent,
      maxRent,
      lat,
      lng,
      radiusKm,
    } = req.query;

    /*
    |--------------------------------------------------------------------------
    | BASE FILTER
    |--------------------------------------------------------------------------
    */

    const filter = {
      isActive: true,
      isAvailable: true,
    };

    /*
    |--------------------------------------------------------------------------
    | SEEKER VISIBILITY SECURITY
    |--------------------------------------------------------------------------
    |
    | Seeker ko sirf admin-approved properties milengi.
    |
    | Owner ke existing behavior ko preserve kiya gaya hai.
    |--------------------------------------------------------------------------
    */

    if (
      req.user?.role === "seeker"
    ) {
      filter.isVerified = true;

      filter.moderationStatus =
        "approved";
    }

    const hasLatitude =
      lat !== undefined &&
      lat !== null &&
      String(lat).trim() !== "";

    const hasLongitude =
      lng !== undefined &&
      lng !== null &&
      String(lng).trim() !== "";

    if (
      hasLatitude !==
      hasLongitude
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Both latitude and longitude are required for nearby search",
      });
    }

    let useNearbySearch =
      false;

    if (
      hasLatitude &&
      hasLongitude
    ) {
      const latitude =
        Number(lat);

      const longitude =
        Number(lng);

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        ) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide valid latitude and longitude values",
        });
      }

      let maxDistanceKm = 25;

      if (
        radiusKm !==
          undefined &&
        radiusKm !== null &&
        String(
          radiusKm
        ).trim() !== ""
      ) {
        maxDistanceKm =
          Number(radiusKm);

        if (
          !Number.isFinite(
            maxDistanceKm
          ) ||
          maxDistanceKm <= 0 ||
          maxDistanceKm > 100
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "radiusKm must be greater than 0 and at most 100",
            });
        }
      }

      filter.location = {
        $near: {
          $geometry: {
            type: "Point",

            coordinates: [
              longitude,
              latitude,
            ],
          },

          $maxDistance:
            maxDistanceKm *
            1000,
        },
      };

      useNearbySearch =
        true;
    }

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

    if (
      availableFor &&
      propertyType !== "hotel"
    ) {
      filter.availableFor =
        availableFor;
    }

    /*
    |--------------------------------------------------------------------------
    | RENT FILTER
    |--------------------------------------------------------------------------
    */

    if (
      minRent ||
      maxRent
    ) {
      if (
        propertyType ===
        "hotel"
      ) {
        const hotelPriceConditions =
          [];

        const acPriceCondition = {
          acAvailable: true,
          acPricePerDay: {},
        };

        if (minRent) {
          acPriceCondition
            .acPricePerDay
            .$gte =
            Number(minRent);
        }

        if (maxRent) {
          acPriceCondition
            .acPricePerDay
            .$lte =
            Number(maxRent);
        }

        hotelPriceConditions.push(
          acPriceCondition
        );

        const nonAcPriceCondition =
          {
            nonAcAvailable:
              true,

            nonAcPricePerDay:
              {},
          };

        if (minRent) {
          nonAcPriceCondition
            .nonAcPricePerDay
            .$gte =
            Number(minRent);
        }

        if (maxRent) {
          nonAcPriceCondition
            .nonAcPricePerDay
            .$lte =
            Number(maxRent);
        }

        hotelPriceConditions.push(
          nonAcPriceCondition
        );

        filter.$or =
          hotelPriceConditions;
      } else {
        filter.monthlyRent =
          {};

        if (minRent) {
          filter.monthlyRent
            .$gte =
            Number(minRent);
        }

        if (maxRent) {
          filter.monthlyRent
            .$lte =
            Number(maxRent);
        }
      }
    }

    let propertyQuery =
      Property.find(
        filter
      ).populate(
        "owner",
        "name phone email"
      );

    /*
    |--------------------------------------------------------------------------
    | SORT
    |--------------------------------------------------------------------------
    */

    if (!useNearbySearch) {
      propertyQuery =
        propertyQuery.sort({
          createdAt: -1,
        });
    }

    const properties =
      await propertyQuery;

    return res.status(200).json({
      success: true,
      count:
        properties.length,
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

const getPropertyById =
  async (req, res) => {
    try {
      /*
      |--------------------------------------------------------------------------
      | ROLE-AWARE PROPERTY DETAIL FILTER
      |--------------------------------------------------------------------------
      */

      const filter = {
        _id: req.params.id,
        isActive: true,
      };

      /*
       * Seeker direct URL / ID se pending/rejected/occupied
       * property access nahi kar sakta.
       */

      if (
        req.user?.role ===
        "seeker"
      ) {
        filter.isAvailable =
          true;

        filter.isVerified =
          true;

        filter.moderationStatus =
          "approved";
      }

      const property =
        await Property.findOne(
          filter
        ).populate(
          "owner",
          "name phone email"
        );

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          property,
        });
    } catch (error) {
      console.error(
        "Get property details error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch property details",
        });
    }
  };

const getOwnerProperties =
  async (req, res) => {
    try {
      /*
       * Owner ko pending / approved / rejected
       * sab apni properties dikhengi.
       */

      const properties =
        await Property.find({
          owner:
            req.user.userId,
          isActive: true,
        }).sort({
          createdAt: -1,
        });

      return res
        .status(200)
        .json({
          success: true,
          count:
            properties.length,
          properties,
        });
    } catch (error) {
      console.error(
        "Get owner properties error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch owner properties",
        });
    }
  };

const updatePropertyAvailability =
  async (req, res) => {
    try {
      const {
        isAvailable,
      } = req.body;

      if (
        typeof isAvailable !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "isAvailable must be true or false",
          });
      }

      const property =
        await Property.findOne({
          _id: req.params.id,
          owner:
            req.user.userId,
          isActive: true,
        });

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found",
          });
      }

      property.isAvailable =
        isAvailable;

      await property.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            isAvailable
              ? "Property marked as available"
              : "Property marked as occupied",

          property,
        });
    } catch (error) {
      console.error(
        "Update property availability error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update property availability",
        });
    }
  };

const updateProperty =
  async (req, res) => {
    try {
      const property =
        await Property.findOne({
          _id: req.params.id,
          owner:
            req.user.userId,
          isActive: true,
        });

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found",
          });
      }

      /*
      |--------------------------------------------------------------------------
      | ALLOWED FIELDS
      |--------------------------------------------------------------------------
      */

      const allowedFields =
        [
          "title",
          "description",
          "propertyType",
          "monthlyRent",
          "securityDeposit",
          "availableFor",
          "furnishing",

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

      let propertyDetailsChanged =
        false;

      allowedFields.forEach(
        (field) => {
          if (
            req.body[
              field
            ] !== undefined
          ) {
            property[field] =
              req.body[
                field
              ];

            propertyDetailsChanged =
              true;
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
          property
            .acAvailable !==
            true &&
          property
            .nonAcAvailable !==
            true
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "At least AC or Non-AC must be available for hotel",
            });
        }

        if (
          property
            .acAvailable ===
          true
        ) {
          if (
            property
              .acPricePerDay ===
              undefined ||
            property
              .acPricePerDay ===
              null ||
            property
              .acPricePerDay ===
              "" ||
            !Number.isFinite(
              Number(
                property
                  .acPricePerDay
              )
            ) ||
            Number(
              property
                .acPricePerDay
            ) < 0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,
                message:
                  "Please enter valid AC per-day price",
              });
          }

          property.acPricePerDay =
            Number(
              property
                .acPricePerDay
            );
        } else {
          property.acPricePerDay =
            null;
        }

        if (
          property
            .nonAcAvailable ===
          true
        ) {
          if (
            property
              .nonAcPricePerDay ===
              undefined ||
            property
              .nonAcPricePerDay ===
              null ||
            property
              .nonAcPricePerDay ===
              "" ||
            !Number.isFinite(
              Number(
                property
                  .nonAcPricePerDay
              )
            ) ||
            Number(
              property
                .nonAcPricePerDay
            ) < 0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,
                message:
                  "Please enter valid Non-AC per-day price",
              });
          }

          property.nonAcPricePerDay =
            Number(
              property
                .nonAcPricePerDay
            );
        } else {
          property.nonAcPricePerDay =
            null;
        }

        property.monthlyRent =
          0;

        property.securityDeposit =
          0;

        property.availableFor =
          "anyone";

        property.furnishing =
          "unfurnished";
      } else {
        property.acAvailable =
          false;

        property.acPricePerDay =
          null;

        property.nonAcAvailable =
          false;

        property.nonAcPricePerDay =
          null;

        if (
          property.monthlyRent ===
            undefined ||
          property.monthlyRent ===
            null
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Monthly rent is required",
            });
        }

        if (
          !property.availableFor
        ) {
          return res
            .status(400)
            .json({
              success:
                false,
              message:
                "Available for is required",
            });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | RE-REVIEW AFTER OWNER EDIT
      |--------------------------------------------------------------------------
      */

      if (
        propertyDetailsChanged
      ) {
        property.isVerified =
          false;

        property.moderationStatus =
          "pending";

        property.rejectionReason =
          "";
      }

      await property.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            propertyDetailsChanged
              ? "Property updated and sent for review"
              : "Property updated successfully",

          property,
        });
    } catch (error) {
      console.error(
        "Update property error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update property",
        });
    }
  };

const deleteProperty =
  async (req, res) => {
    try {
      const property =
        await Property.findOne({
          _id: req.params.id,
          owner:
            req.user.userId,
          isActive: true,
        });

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found",
          });
      }

      property.isActive =
        false;

      await property.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Property deleted successfully",
        });
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to delete property",
        });
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN - PENDING PROPERTIES
|--------------------------------------------------------------------------
*/

const getPendingProperties =
  async (req, res) => {
    try {
      const properties =
        await Property.find({
          isActive: true,
          isVerified: false,

          $or: [
            {
              moderationStatus:
                "pending",
            },

            {
              moderationStatus:
                {
                  $exists:
                    false,
                },
            },
          ],
        })
          .populate(
            "owner",
            "name phone email"
          )
          .sort({
            createdAt: -1,
          });

      return res
        .status(200)
        .json({
          success: true,
          count:
            properties.length,
          properties,
        });
    } catch (error) {
      console.error(
        "Get pending properties error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch pending properties",
        });
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN - APPROVE PROPERTY
|--------------------------------------------------------------------------
*/

const approveProperty =
  async (req, res) => {
    try {
      const property =
        await Property.findOne({
          _id: req.params.id,
          isActive: true,
        });

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found",
          });
      }

      property.isVerified =
        true;

      property.moderationStatus =
        "approved";

      property.rejectionReason =
        "";

      await property.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Property approved successfully",
          property,
        });
    } catch (error) {
      console.error(
        "Approve property error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to approve property",
        });
    }
  };

/*
|--------------------------------------------------------------------------
| ADMIN - REJECT PROPERTY
|--------------------------------------------------------------------------
*/

const rejectProperty =
  async (req, res) => {
    try {
      const {
        reason,
      } = req.body;

      if (
        typeof reason !==
          "string" ||
        !reason.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Rejection reason is required",
          });
      }

      if (
        reason.trim().length >
        500
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Rejection reason must be 500 characters or less",
          });
      }

      const property =
        await Property.findOne({
          _id: req.params.id,
          isActive: true,
        });

      if (!property) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Property not found",
          });
      }

      property.isVerified =
        false;

      property.moderationStatus =
        "rejected";

      property.rejectionReason =
        reason.trim();

      await property.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Property rejected successfully",
          property,
        });
    } catch (error) {
      console.error(
        "Reject property error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to reject property",
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

  getPendingProperties,
  approveProperty,
  rejectProperty,
};