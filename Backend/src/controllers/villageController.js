const Village = require("../models/Village");

/*
|--------------------------------------------------------------------------
| GET VILLAGE
|--------------------------------------------------------------------------
| Public API
| Returns the active village.
*/
const getVillage = async (req, res) => {
  try {
    const village = await Village.findOne({ isActive: true }).lean();

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
    const existingVillage = await Village.findOne({
      name: req.body.name,
      block: req.body.block,
      district: req.body.district,
    });

    if (existingVillage) {
      return res.status(409).json({
        success: false,
        message: "Village already exists",
        data: existingVillage,
      });
    }

    const village = await Village.create(req.body);

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
| UPDATE VILLAGE
|--------------------------------------------------------------------------
*/
const updateVillage = async (req, res) => {
  try {
    const { id } = req.params;

    const village = await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        village[key] = req.body[key];
      }
    });

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
| GET VILLAGE PLACES
|--------------------------------------------------------------------------
| Public directory.
|
| Optional query:
| ?type=school
| ?search=school
| ?verified=true
*/
const getVillagePlaces = async (req, res) => {
  try {
    const { type, search, verified } = req.query;

    const village = await Village.findOne({
      isActive: true,
    }).lean();

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    let places = Array.isArray(village.places)
      ? village.places
      : [];

    /*
    |--------------------------------------------------------------------------
    | Filter by category
    |--------------------------------------------------------------------------
    */
    if (type && type !== "all") {
      places = places.filter(
        (place) =>
          String(place.type).toLowerCase() ===
          String(type).toLowerCase()
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */
    if (search) {
      const keyword = String(search).toLowerCase().trim();

      places = places.filter((place) => {
        const name = String(place.name || "").toLowerCase();
        const address = String(place.address || "").toLowerCase();
        const description = String(
          place.description || ""
        ).toLowerCase();

        return (
          name.includes(keyword) ||
          address.includes(keyword) ||
          description.includes(keyword)
        );
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verified filter
    |--------------------------------------------------------------------------
    */
    if (verified === "true") {
      places = places.filter(
        (place) => place.verified === true
      );
    }

    return res.status(200).json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    console.error("getVillagePlaces error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch village places",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| ADD VILLAGE PLACE
|--------------------------------------------------------------------------
| Admin can add:
|
| school
| college
| hospital
| temple
| mosque
| ATM
| railway station
| bus stop
| petrol pump
| market
| restaurant
| hotel
| etc.
*/
const addVillagePlace = async (req, res) => {
  try {
    const { id } = req.params;

    const village = await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Place name is required",
      });
    }

    village.places.push({
      ...req.body,
      verified:
        typeof req.body.verified === "boolean"
          ? req.body.verified
          : false,
      isActive:
        typeof req.body.isActive === "boolean"
          ? req.body.isActive
          : true,
    });

    await village.save();

    const newPlace =
      village.places[village.places.length - 1];

    return res.status(201).json({
      success: true,
      message: "Village place added successfully",
      data: newPlace,
    });
  } catch (error) {
    console.error("addVillagePlace error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add village place",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPDATE VILLAGE PLACE
|--------------------------------------------------------------------------
*/
const updateVillagePlace = async (req, res) => {
  try {
    const { id, placeId } = req.params;

    const village = await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const place = village.places.id(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Village place not found",
      });
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        place[key] = req.body[key];
      }
    });

    await village.save();

    return res.status(200).json({
      success: true,
      message: "Village place updated successfully",
      data: place,
    });
  } catch (error) {
    console.error("updateVillagePlace error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update village place",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| DELETE VILLAGE PLACE
|--------------------------------------------------------------------------
*/
const deleteVillagePlace = async (req, res) => {
  try {
    const { id, placeId } = req.params;

    const village = await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const place = village.places.id(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Village place not found",
      });
    }

    place.deleteOne();

    await village.save();

    return res.status(200).json({
      success: true,
      message: "Village place deleted successfully",
    });
  } catch (error) {
    console.error("deleteVillagePlace error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete village place",
      error: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| UPLOAD VILLAGE IMAGES
|--------------------------------------------------------------------------
| This endpoint expects image URLs/public IDs from the
| existing upload middleware/controller flow.
*/
const uploadVillageImages = async (req, res) => {
  try {
    const { id } = req.params;

    const village = await Village.findById(id);

    if (!village) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    let uploadedImages = [];

    /*
    |--------------------------------------------------------------------------
    | Cloudinary / uploaded files
    |--------------------------------------------------------------------------
    */
    if (Array.isArray(req.files) && req.files.length > 0) {
      uploadedImages = req.files.map((file) => ({
        url: file.path || file.secure_url || file.url,
        publicId: file.filename || file.public_id || "",
        caption: "",
      }));
    }

    /*
    |--------------------------------------------------------------------------
    | Direct image payload support
    |--------------------------------------------------------------------------
    */
    if (
      Array.isArray(req.body.images) &&
      req.body.images.length > 0
    ) {
      uploadedImages = [
        ...uploadedImages,
        ...req.body.images.map((image) => ({
          url: image.url || image,
          publicId: image.publicId || "",
          caption: image.caption || "",
        })),
      ];
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images provided",
      });
    }

    village.images.push(...uploadedImages);

    await village.save();

    return res.status(200).json({
      success: true,
      message: "Village images uploaded successfully",
      data: village.images,
    });
  } catch (error) {
    console.error("uploadVillageImages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload village images",
      error: error.message,
    });
  }
};


module.exports = {
  getVillage,
  createVillage,
  updateVillage,
  uploadVillageImages,
  getVillagePlaces,
  addVillagePlace,
  updateVillagePlace,
  deleteVillagePlace,
};