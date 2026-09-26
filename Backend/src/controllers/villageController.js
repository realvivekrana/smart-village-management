const Village = require("../models/Village");
const cloudinaryService = require("../services/cloudinaryService");

/*
|--------------------------------------------------------------------------
| GET ACTIVE VILLAGE
|--------------------------------------------------------------------------
*/

const getVillage = async (req, res) => {
  try {
    const village = await Village.findOne({
      isActive: true,
    }).lean();

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village information not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: village,
    });
  } catch (error) {
    console.error("getVillage error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch village information",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE VILLAGE
|--------------------------------------------------------------------------
*/

const createVillage = async (req, res) => {
  try {
    const {
      name,
      block,
      district,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Village name is required",
      });
    }

    const existingVillage =
      await Village.findOne({
        name: String(name).trim(),
        block: block || "",
        district: district || "",
      });

    if (existingVillage) {
      return res.status(409).json({
        success: false,
        message: "Village already exists",
        data: existingVillage,
      });
    }

    const village = await Village.create({
      ...req.body,
      name: String(name).trim(),
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Village created successfully",
      data: village,
    });
  } catch (error) {
    console.error("createVillage error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create village",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| NORMALIZE VILLAGE PAYLOAD
|--------------------------------------------------------------------------
| Frontend ke flat/nested fields ko consistent MongoDB structure me rakhta hai.
|--------------------------------------------------------------------------
*/

const normalizeVillagePayload = (body = {}) => {
  const payload = {};

  /*
  |--------------------------------------------------------------------------
  | Simple fields
  |--------------------------------------------------------------------------
  */

  const simpleFields = [
    "name",
    "localName",
    "description",
    "history",
    "culture",
    "block",
    "district",
    "state",
    "country",
    "pincode",
    "stdCode",
    "website",
    "assemblyConstituency",
    "lokSabhaConstituency",
    "image",
  ];

  simpleFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] =
        typeof body[field] === "string"
          ? body[field].trim()
          : body[field];
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Numeric fields
  |--------------------------------------------------------------------------
  */

  const numericFields = [
    "population",
    "area",
    "altitude",
    "latitude",
    "longitude",
  ];

  numericFields.forEach((field) => {
    if (
      body[field] !== undefined &&
      body[field] !== null &&
      body[field] !== ""
    ) {
      const value = Number(body[field]);

      if (!Number.isNaN(value)) {
        payload[field] = value;
      }
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Arrays
  |--------------------------------------------------------------------------
  */

  const arrayFields = [
    "languages",
    "rivers",
    "facilities",
  ];

  arrayFields.forEach((field) => {
    if (body[field] !== undefined) {
      if (Array.isArray(body[field])) {
        payload[field] = body[field]
          .map((item) => String(item).trim())
          .filter(Boolean);
      } else if (typeof body[field] === "string") {
        payload[field] = body[field]
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Contact
  |--------------------------------------------------------------------------
  */

  if (
    body.contact !== undefined ||
    body.phone !== undefined ||
    body.email !== undefined ||
    body.address !== undefined
  ) {
    const existingContact =
      body.contact &&
      typeof body.contact === "object"
        ? body.contact
        : {};

    payload.contact = {
      phone:
        existingContact.phone ??
        body.phone ??
        "",

      email:
        existingContact.email ??
        body.email ??
        "",

      address:
        existingContact.address ??
        body.address ??
        "",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Sarpanch
  |--------------------------------------------------------------------------
  */

  if (
    body.sarpanch !== undefined ||
    body.sarpanchName !== undefined ||
    body.sarpanchPhone !== undefined
  ) {
    const existingSarpanch =
      body.sarpanch &&
      typeof body.sarpanch === "object"
        ? body.sarpanch
        : {};

    payload.sarpanch = {
      name:
        existingSarpanch.name ??
        body.sarpanchName ??
        "",

      phone:
        existingSarpanch.phone ??
        body.sarpanchPhone ??
        "",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | How To Reach
  |--------------------------------------------------------------------------
  */

  if (
    body.howToReach !== undefined ||
    body.road !== undefined ||
    body.rail !== undefined ||
    body.air !== undefined
  ) {
    const existingHowToReach =
      body.howToReach &&
      typeof body.howToReach === "object"
        ? body.howToReach
        : {};

    payload.howToReach = {
      road:
        existingHowToReach.road ??
        body.road ??
        "",

      rail:
        existingHowToReach.rail ??
        body.rail ??
        "",

      air:
        existingHowToReach.air ??
        body.air ??
        "",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Coordinates
  |--------------------------------------------------------------------------
  */

  const sourceCoordinates =
    body.location &&
    typeof body.location === "object"
      ? body.location
      : body.coordinates &&
        typeof body.coordinates === "object"
      ? body.coordinates
      : {};

  const lat =
    sourceCoordinates.lat ??
    body.latitude;

  const lng =
    sourceCoordinates.lng ??
    body.longitude;

  if (
    lat !== undefined ||
    lng !== undefined
  ) {
    const latitude =
      lat === "" ||
      lat === null ||
      lat === undefined
        ? null
        : Number(lat);

    const longitude =
      lng === "" ||
      lng === null ||
      lng === undefined
        ? null
        : Number(lng);

    payload.location = {
      lat: Number.isNaN(latitude)
        ? null
        : latitude,

      lng: Number.isNaN(longitude)
        ? null
        : longitude,
    };

    payload.coordinates = {
      lat: Number.isNaN(latitude)
        ? null
        : latitude,

      lng: Number.isNaN(longitude)
        ? null
        : longitude,
    };

    if (!Number.isNaN(latitude)) {
      payload.latitude = latitude;
    }

    if (!Number.isNaN(longitude)) {
      payload.longitude = longitude;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Dynamic collections
  |--------------------------------------------------------------------------
  */

  const collectionFields = [
    "places",
    "nearbyVillages",
    "nearbyCities",
    "nearbyTaluks",
    "nearbyDistricts",
    "nearbyRailwayStations",
    "nearbyAirports",
    "nearbyTouristPlaces",
  ];

  collectionFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = Array.isArray(body[field])
        ? body[field]
        : [];
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Existing gallery data
  |--------------------------------------------------------------------------
  */

  if (body.images !== undefined) {
    payload.images = Array.isArray(body.images)
      ? body.images
      : [];
  }

  return payload;
};

/*
|--------------------------------------------------------------------------
| UPDATE VILLAGE BY ID
|--------------------------------------------------------------------------
*/

const updateVillage = async (req, res) => {
  try {
    const { id } = req.params;

    const village =
      await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const payload =
      normalizeVillagePayload(req.body);

    Object.entries(payload).forEach(
      ([key, value]) => {
        if (value !== undefined) {
          village[key] = value;
        }
      }
    );

    await village.save();

    return res.status(200).json({
      success: true,
      message: "Village updated successfully",
      data: village,
    });
  } catch (error) {
    console.error("updateVillage error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update village",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ACTIVE VILLAGE
|--------------------------------------------------------------------------
*/

const updateActiveVillage = async (
  req,
  res
) => {
  try {
    const village =
      await Village.findOne({
        isActive: true,
      });

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Active village not found",
      });
    }

    const payload =
      normalizeVillagePayload(req.body);

    Object.entries(payload).forEach(
      ([key, value]) => {
        if (value !== undefined) {
          village[key] = value;
        }
      }
    );

    await village.save();

    return res.status(200).json({
      success: true,
      message:
        "Village settings updated successfully",
      data: village,
    });
  } catch (error) {
    console.error(
      "updateActiveVillage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update village settings",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET VILLAGE PLACES
|--------------------------------------------------------------------------
*/

const getVillagePlaces = async (
  req,
  res
) => {
  try {
    const {
      type,
      search,
      verified,
    } = req.query;

    const village =
      await Village.findOne({
        isActive: true,
      }).lean();

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    let places = Array.isArray(
      village.places
    )
      ? village.places
      : [];

    if (type && type !== "all") {
      places = places.filter(
        (place) =>
          String(
            place.type || ""
          ).toLowerCase() ===
          String(type).toLowerCase()
      );
    }

    if (search) {
      const keyword =
        String(search)
          .toLowerCase()
          .trim();

      places = places.filter(
        (place) => {
          const name =
            String(
              place.name || ""
            ).toLowerCase();

          const address =
            String(
              place.address || ""
            ).toLowerCase();

          const description =
            String(
              place.description || ""
            ).toLowerCase();

          return (
            name.includes(keyword) ||
            address.includes(keyword) ||
            description.includes(keyword)
          );
        }
      );
    }

    if (verified === "true") {
      places = places.filter(
        (place) =>
          place.verified === true
      );
    }

    return res.status(200).json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    console.error(
      "getVillagePlaces error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch village places",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| ADD VILLAGE PLACE
|--------------------------------------------------------------------------
*/

const addVillagePlace = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const village =
      await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    if (
      !req.body.name ||
      !String(req.body.name).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Place name is required",
      });
    }

    if (!Array.isArray(village.places)) {
      village.places = [];
    }

    village.places.push({
      ...req.body,
      name: String(
        req.body.name
      ).trim(),

      verified:
        req.body.verified === true,

      isActive:
        req.body.isActive !== false,
    });

    await village.save();

    const newPlace =
      village.places[
        village.places.length - 1
      ];

    return res.status(201).json({
      success: true,
      message:
        "Village place added successfully",
      data: newPlace,
    });
  } catch (error) {
    console.error(
      "addVillagePlace error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add village place",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE VILLAGE PLACE
|--------------------------------------------------------------------------
*/

const updateVillagePlace = async (
  req,
  res
) => {
  try {
    const {
      id,
      placeId,
    } = req.params;

    const village =
      await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const place =
      village.places.id(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        message:
          "Village place not found",
      });
    }

    Object.keys(req.body).forEach(
      (key) => {
        if (
          req.body[key] !==
          undefined
        ) {
          place[key] =
            req.body[key];
        }
      }
    );

    await village.save();

    return res.status(200).json({
      success: true,
      message:
        "Village place updated successfully",
      data: place,
    });
  } catch (error) {
    console.error(
      "updateVillagePlace error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update village place",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE VILLAGE PLACE
|--------------------------------------------------------------------------
*/

const deleteVillagePlace = async (
  req,
  res
) => {
  try {
    const {
      id,
      placeId,
    } = req.params;

    const village =
      await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const place =
      village.places.id(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        message:
          "Village place not found",
      });
    }

    place.deleteOne();

    await village.save();

    return res.status(200).json({
      success: true,
      message:
        "Village place deleted successfully",
      data: village.places,
    });
  } catch (error) {
    console.error(
      "deleteVillagePlace error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete village place",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPLOAD VILLAGE IMAGES
|--------------------------------------------------------------------------
*/

const uploadVillageImages = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const village =
      await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    if (
      !Array.isArray(req.files) ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one image",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Upload files to Cloudinary
    |--------------------------------------------------------------------------
    */

    const results =
      await cloudinaryService.uploadMultipleImages(
        req.files,
        "smart-village/village"
      );

    const uploadedImages =
      results.map(
        (result, index) => ({
          url: result.url,
          publicId:
            result.publicId,

          caption:
            Array.isArray(
              req.body.captions
            )
              ? req.body.captions[
                  index
                ] || ""
              : "",

          title: "",

          category:
            "Village",
        })
      );

    if (
      !Array.isArray(
        village.images
      )
    ) {
      village.images = [];
    }

    village.images.push(
      ...uploadedImages
    );

    await village.save();

    return res.status(200).json({
      success: true,
      message:
        "Village images uploaded successfully",
      data: village.images,
    });
  } catch (error) {
    console.error(
      "uploadVillageImages error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Cloudinary configuration error
    |--------------------------------------------------------------------------
    */

    if (
      error.message ===
      "Cloudinary is not configured"
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Image upload service is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to Backend/.env",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload village images",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE VILLAGE IMAGE
|--------------------------------------------------------------------------
*/

const deleteVillageImage = async (
  req,
  res
) => {
  try {
    const {
      id,
      imageId,
    } = req.params;

    const village =
      await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const image =
      village.images.id(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    if (image.publicId) {
      await cloudinaryService.deleteImage(
        image.publicId
      );
    }

    image.deleteOne();

    await village.save();

    return res.status(200).json({
      success: true,
      message:
        "Village image deleted successfully",
      data: village.images,
    });
  } catch (error) {
    console.error(
      "deleteVillageImage error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete village image",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  getVillage,
  createVillage,
  updateVillage,
  updateActiveVillage,
  uploadVillageImages,
  deleteVillageImage,
  getVillagePlaces,
  addVillagePlace,
  updateVillagePlace,
  deleteVillagePlace,
};