const Pet = require("../models/pet");
const Owner = require("../models/Owner");
const mongoose = require("mongoose");
const Visit = require("../models/Visit");
const { DateTime } = require("luxon");
const Boarding = require("../models/boarding");
const { cloudinary } = require("../config/cloudinary");

exports.addPet = async (req, res) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ownerName, phone, email, address } = req.body;
    const pets = typeof req.body.pets === "string" ? JSON.parse(req.body.pets) : req.body.pets;

    let owner = await Owner.findOne({ email });

    if (!owner) {
      owner = await Owner.create(
        [
          {
            name: ownerName,
            phone,
            email,
            address,
            pets: [],
          },
        ],
        { session }
      );
      owner = owner[0];
    }

    // Upload pet photos to Cloudinary if provided
    const photoUrls = {};
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map(async (file) => {
          const match = file.fieldname.match(/^photo_(\d+)$/);
          if (!match) return;
          const idx = parseInt(match[1]);
          const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
          const result = await cloudinary.uploader.upload(dataUri, {
            folder: "doggosheaven/pets",
            transformation: [{ width: 400, height: 400, crop: "fill" }],
          });
          photoUrls[idx] = result.secure_url;
        })
      );
    }

    const petDocuments = pets.map((pet, idx) => ({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      sex: pet.sex,
      color: pet.color,
      dob: pet.dob,
      owner: owner._id,
      vaccinations: pet.vaccinations || [],
      neutered: pet.neutered,
      registrationDate: pet.registrationDate,
      image: photoUrls[idx] || null,
      createdBy: req.userId || null,
    }));

    console.log(petDocuments);
    
    const savedPets = await Pet.create(petDocuments, { session });

    
    owner.pets.push(...savedPets.map((pet) => pet._id));
    await owner.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    // Alert for admin — new pet registered
    try {
      const Alert = require('../models/alert');
      const petNames = pets.map(p => p.name).join(', ');
      await Alert.create({
        alertType: 'newPet',
        serviceName: petNames,
        performedBy: ownerName || 'Staff',
        forRole: 'admin',
      });
    } catch (_) {}

    // Fetch the complete owner data with populated pets
    const populatedOwner = await Owner.findById(owner._id).populate("pets");

    res.status(200).json({
      success: true,
      message: "Pet information saved successfully",
      owner: populatedOwner,
    });
  } catch (error) {
    // If there's an error, abort the transaction
    await session.abortTransaction();
    console.error("Error saving information:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save information",
      details: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.getPetList = async (req, res) => {
  try {
    const list = await Pet.find({})
      .populate("owner", "name") // Populate owner only with the 'name' field
      .exec();
    return res
      .status(200)
      .json({ success: true, message: "List fetched successfully", list });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const petId = req.params.id;
    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ error: "Invalid pet ID format" });
    }

    // Fetch the pet details and populate the owner reference
    const pet = await Pet.findById(petId).populate("owner");
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Send the pet data back to the client
    return res.status(200).json({
      success: true,
      pet,
      message: "Pet details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching pet by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.filterPetsByBreedAndSpecies = async (req, res) => {
  try {
    const { breed, species } = req.query;
    let query = {};

    if (breed) {
      query.breed = breed;
    }
    if (species) {
      query.species = species;
    }

    const pets = await Pet.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pets.length,
      pets,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pets",
      error: error.message,
    });
  }
};

exports.getFilteredPetsByNameAndPhone = async (req, res) => {
  try {
    const { name, phone } = req.query;

    // if (name && phone) {
    //   list = await Pet.find({
    //     name: { $regex: new RegExp(name, "i") },
    //   }).populate({
    //     path: "owner",
    //     match: { phone: phone },
    //     select: "name",
    //   });
    // } else {
    //   list = await Pet.find({}).populate({
    //     path: "owner",
    //     select: "name",
    //   });
    // }
    const pipeline = [
      // Optional name filter
      ...(name
        ? [
            {
              $match: {
                name: { $regex: new RegExp(name, "i") },
              },
            },
          ]
        : []),

      // Join with owner
      {
        $lookup: {
          from: "owners", // replace with your actual collection name
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true, // include pets with no owner
        },
      },

      // Optional phone filter on joined owner
      ...(phone
        ? [
            {
              $match: {
                "owner.phone": phone,
              },
            },
          ]
        : []),

      // Optional projection to include only what you need
      {
        $project: {
          name: 1,
          species: 1,
          breed: 1,
          image: 1,
          isBlacklisted: 1,
          blacklistReason: 1,
          owner: { _id: 1, name: 1, phone: 1, email: 1 },
        },
      },
    ];

    const list = await Pet.aggregate(pipeline);

    if (!list) {
      return res
        .status(404)
        .json({ success: false, message: "Pet doesn't exist" });
    }

    return res.status(200).json({
      success: true,
      message: "Pets fetched successfully",
      list,
    });
  } catch (error) {
    console.error("Error in fetching pets", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getPetDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    // Ensure valid date
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Create start and end of day in UTC to match MongoDB storage
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const pets = await Pet.find({
      registrationDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).populate("owner");

    res.json({ pets });
  } catch (error) {
    console.error("Error in getPetDate:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPetVisitHistory = async (req, res) => {
  try {
    const visits = await Visit.find({ pet: req.params.petId })
      .populate({
        path: "itemDetails",
        populate: { path: "item", select: "itemName" },
      })
      .sort("-createdAt");
    res.json({ visits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPetByBirthday = async (req, res) => {
  try {
    const today = DateTime.now().setZone("Asia/Kolkata");
    const todayMonth = today.month;
    const todayDay = today.day;

    const List = await Pet.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dob" }, todayMonth] },
          { $eq: [{ $dayOfMonth: "$dob" }, todayDay] },
        ],
      },
    }).populate({
      path: "owner",
      select: "name phone email",
    });

    return res.status(200).json({
      success: true,
      List,
    });
  } catch (err) {
    console.log("Error in get pet by birthday controller ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getPetByBirthday = async (req, res) => {
  try {
    const today = DateTime.now().setZone("Asia/Kolkata");
    const todayMonth = today.month;
    const todayDay = today.day;

    const List = await Pet.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$dob" }, todayMonth] },
          { $eq: [{ $dayOfMonth: "$dob" }, todayDay] },
        ],
      },
    }).populate({
      path: "owner",
      select: "name phone email",
    });

    return res.status(200).json({
      success: true,
      List,
    });
  } catch (err) {
    console.log("Error in get pet by birthday controller ", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getBoardedPetList = async (req, res) => {
  try {
    const { type } = req.query;
    const boardedPetList = await Boarding.find({
      boardingType: type,
      isBoarded: true,
    }).populate({
      path: "petId",
      select: "name",
      populate: {
        path: "owner",
        select: "name phone",
      },
    });

    return res.status(200).json({
      success: true,
      boardedPetList,
      message: "List fetched successfully",
    });
  } catch (err) {
    console.log("Error in get boarded pet list", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.editPetDetails = async (req, res) => {
  
  try {
    const {
      name,
      species,
      breed,
      color,
      customBreed,
      dob,
      registrationDate,
      sex,
      vaccinations,
      neutered,
      id,
    } = req.body;

    if (
      !name ||
      !species ||
      !color ||
      !dob ||
      !registrationDate ||
      !sex ||
      neutered===null
    ) {
      return res.json({
        success: false,
        message: "Please provide all details",
      });
    }

    if (!breed && !customBreed) {
      return res.json({
        success: false,
        message: "Please provide breed details",
      });
    }

    // Save all pets
    const savedPet = await Pet.findByIdAndUpdate(id, {
      name,
      species,
      breed: customBreed ? customBreed : breed,
      color,
      sex,
      dob,
      registrationDate,
      neutered,
      vaccinations,
    },{ new: true, runValidators: true });


    return res.status(200).json({
      success: true,
      message: "Pet information saved successfully",
    });
  } catch (error) {
    // If there's an error, abort the transaction
  
    console.log("Error in editpetinfo controller", error);
    res.status(500).json({
      success: false,
      message: "Failed to save information",
    });
  } 
};

exports.editOwnerDetails = async (req, res) => {
  
  try {
    const {
      name,
      phone,
      email,
      address,
      id
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !address 
    ) {
      return res.json({
        success: false,
        message: "Please provide all details",
      });
    }

    // Save all pets
    const savedOwner = await Owner.findByIdAndUpdate(id, {
      name,
      phone,
      email,
      address
    },{ new: true, runValidators: true });


    return res.status(200).json({
      success: true,
      message: "Pet information saved successfully",
    });
  } catch (error) {
    // If there's an error, abort the transaction
  
    console.log("Error in editpetinfo controller", error);
    res.status(500).json({
      success: false,
      message: "Failed to save information",
    });
  } 
};

// ── Blacklist / Unblacklist a pet ─────────────────────────────────────────────
exports.toggleBlacklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlacklisted, blacklistReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid pet ID" });

    const staffName = req.user?.fullName || req.user?.name || "Staff";

    const pet = await Pet.findByIdAndUpdate(
      id,
      {
        isBlacklisted,
        blacklistReason: isBlacklisted ? blacklistReason || "" : "",
        blacklistedAt: isBlacklisted ? new Date() : null,
        blacklistedBy: isBlacklisted ? staffName : "",
      },
      { new: true }
    ).populate("owner", "name phone email address");

    if (!pet)
      return res.status(404).json({ success: false, message: "Pet not found" });

    // Blacklist hone par customer ko notification bhejo
    if (isBlacklisted && pet.owner) {
      try {
        const VisitNotification = require("../models/VisitNotification");
        const User = require("../models/user");
        // Customer User model me same email se dhundho
        const customerUser = await User.findOne({ email: pet.owner.email, role: 'customer' });
        // Agar customer role nahi mila to kisi bhi role se try karo
        const targetUser = customerUser || await User.findOne({ email: pet.owner.email });
        if (targetUser) {
          await VisitNotification.create({
            userId: targetUser._id,
            title: `\uD83D\uDEAB ${pet.name} has been blacklisted`,
            body: `Your pet ${pet.name} has been blacklisted. Reason: ${blacklistReason || "Not specified"}. You can request an unblock from My Pets section.`,
            petName: pet.name,
            purpose: "blacklist",
          });
        }
      } catch (e) { console.log('blacklist notif error:', e.message); }
      try {
        const Alert = require("../models/alert");
        await Alert.create({
          alertType: "serviceAction",
          serviceName: `Blacklisted: ${pet.name}`,
          performedBy: staffName,
          action: "updated",
          forRole: "admin",
          petInfo: pet._id,
        });
      } catch (_) {}
    }

    return res.status(200).json({
      success: true,
      message: isBlacklisted ? "Pet blacklisted successfully" : "Pet removed from blacklist",
      pet,
    });
  } catch (error) {
    console.log("Error in toggleBlacklist:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Get all blacklisted pets ──────────────────────────────────────────────────
exports.getBlacklistedPets = async (req, res) => {
  try {
    const pets = await Pet.find({ isBlacklisted: true })
      .populate("owner", "name phone email address")
      .sort({ blacklistedAt: -1 });

    return res.status(200).json({
      success: true,
      count: pets.length,
      pets,
    });
  } catch (error) {
    console.log("Error in getBlacklistedPets:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Customer: Submit unblock request ─────────────────────────────────────────
exports.submitUnblockRequest = async (req, res) => {
  try {
    const { petId, reason } = req.body;
    if (!petId || !reason?.trim())
      return res.status(400).json({ success: false, message: "Pet ID and reason are required." });

    const pet = await Pet.findById(petId).populate("owner");
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found." });
    if (!pet.isBlacklisted)
      return res.status(400).json({ success: false, message: "This pet is not blacklisted." });

    const BlacklistRequest = require("../models/BlacklistRequest");
    const existing = await BlacklistRequest.findOne({ pet: petId, status: "pending" });
    if (existing)
      return res.status(400).json({ success: false, message: "A request is already pending for this pet." });

    const request = await BlacklistRequest.create({
      pet: petId,
      owner: pet.owner._id,
      customerUserId: req.user?._id || null,
      reason: reason.trim(),
    });

    try {
      const Alert = require("../models/alert");
      await Alert.create({
        alertType: "serviceAction",
        serviceName: `Unblock Request: ${pet.name}`,
        performedBy: pet.owner?.name || "Customer",
        action: "added",
        forRole: "admin",
        petInfo: pet._id,
      });
    } catch (_) {}

    return res.status(200).json({ success: true, message: "Unblock request submitted successfully.", request });
  } catch (error) {
    console.log("Error in submitUnblockRequest:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Admin: Get all unblock requests ──────────────────────────────────────────
exports.getUnblockRequests = async (req, res) => {
  try {
    const BlacklistRequest = require("../models/BlacklistRequest");
    const requests = await BlacklistRequest.find()
      .populate("pet", "name breed species isBlacklisted blacklistReason")
      .populate("owner", "name phone email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.log("Error in getUnblockRequests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ── Admin: Approve or Reject unblock request ──────────────────────────────────
exports.resolveUnblockRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body;

    const BlacklistRequest = require("../models/BlacklistRequest");
    const request = await BlacklistRequest.findById(id).populate("pet").populate("owner");
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });

    const adminName = req.user?.fullName || req.user?.name || "Admin";
    request.status = action;
    request.adminNote = adminNote || "";
    request.resolvedAt = new Date();
    request.resolvedBy = adminName;
    await request.save();

    if (action === "approved") {
      await Pet.findByIdAndUpdate(request.pet._id, {
        isBlacklisted: false,
        blacklistReason: "",
        blacklistedAt: null,
        blacklistedBy: "",
      });
    }

    try {
      const VisitNotification = require("../models/VisitNotification");
      const User = require("../models/user");
      const customerUser = await User.findOne({ email: request.owner?.email });
      if (customerUser) {
        const petName = request.pet?.name || "Your pet";
        await VisitNotification.create({
          userId: customerUser._id,
          title: action === "approved" ? `✅ ${petName} has been unblocked!` : `❌ Unblock request for ${petName} was rejected`,
          body: action === "approved"
            ? `Your unblock request for ${petName} has been approved.${adminNote ? ` Note: ${adminNote}` : ""}`
            : `Your unblock request for ${petName} was rejected.${adminNote ? ` Reason: ${adminNote}` : " Please contact us for more info."}`,
          petName,
          purpose: action === "approved" ? "unblocked" : "unblock_rejected",
        });
      }
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: action === "approved" ? "Pet unblocked successfully." : "Request rejected.",
    });
  } catch (error) {
    console.log("Error in resolveUnblockRequest:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
