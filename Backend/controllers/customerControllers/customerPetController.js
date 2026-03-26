const Visit = require("./../../models/Visit");
const Pet = require("../../models/pet");
const Owner = require("../../models/Owner");

// Parse DD/MM/YYYY → Date or null
const parseDMY = (str) => {
  if (!str || !str.trim()) return null;
  const parts = str.trim().split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const date = new Date(`${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`);
  return isNaN(date.getTime()) ? null : date;
};

exports.registerPet = async (req, res) => {
  try {
    const { name, species, breed, sex, color, dob, neutered, vaccinations, registrationDate } = req.body;
    const token = req?.headers["authorization"]?.trim();

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); }
    catch { return res.status(401).json({ success: false, message: "Invalid or expired token" }); }

    const userEmail = decoded.userEmail || decoded.email;

    if (!name || !sex || !dob) {
      return res.status(400).json({ success: false, message: "Name, sex, and date of birth are required" });
    }

    let owner = await Owner.findOne({ email: userEmail });
    if (!owner) {
      const User = require("../../models/user");
      const user = await User.findOne({ email: userEmail });
      owner = await Owner.create({
        name: user?.fullName || "Customer",
        email: userEmail,
        phone: user?.phone || "",
        pets: [],
      });
    }

    // image URL from cloudinary (set by multer middleware) or null
    const imageUrl = req.file?.path || null;

    const parsedVaccinations = (typeof vaccinations === "string"
      ? JSON.parse(vaccinations)
      : (vaccinations || []))
      .filter(v => v.name?.trim())
      .map(v => ({
        name: v.name.trim(),
        serialNumber: v.serialNumber?.trim() || "",
        date: parseDMY(v.date),
        nextDueDate: parseDMY(v.nextDueDate),
      }));

    const pet = await Pet.create({
      name: name.trim(),
      species: species || "dog",
      breed: breed || "",
      sex,
      color: color || "",
      dob: new Date(dob),
      neutered: neutered === "true" || neutered === true,
      vaccinations: parsedVaccinations,
      registrationDate: registrationDate ? new Date(registrationDate) : new Date(),
      owner: owner._id,
      image: imageUrl,
    });

    owner.pets.push(pet._id);
    await owner.save();

    return res.status(201).json({ success: true, message: "Pet registered successfully", pet });
  } catch (error) {
    console.log("Error in registerPet:", error.message, error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const { name, species, breed, sex, color, dob, neutered, vaccinations } = req.body;
    const token = req?.headers["authorization"]?.trim();

    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const jwt = require("jsonwebtoken");
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); }
    catch { return res.status(401).json({ success: false, message: "Invalid or expired token" }); }

    const parsedVaccinations = (typeof vaccinations === "string"
      ? JSON.parse(vaccinations)
      : (vaccinations || []))
      .filter(v => v.name?.trim())
      .map(v => ({
        name: v.name.trim(),
        serialNumber: v.serialNumber?.trim() || "",
        date: parseDMY(v.date),
        nextDueDate: parseDMY(v.nextDueDate),
      }));

    const imageUrl = req.file?.path || undefined;

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(species && { species }),
      ...(breed !== undefined && { breed }),
      ...(sex && { sex }),
      ...(color !== undefined && { color }),
      ...(dob && { dob: new Date(dob) }),
      ...(neutered !== undefined && { neutered: neutered === "true" || neutered === true }),
      vaccinations: parsedVaccinations,
      ...(imageUrl && { image: imageUrl }),
    };

    const pet = await Pet.findByIdAndUpdate(petId, updateData, { new: true });
    if (!pet) return res.status(404).json({ success: false, message: "Pet not found" });

    return res.status(200).json({ success: true, message: "Pet updated successfully", pet });
  } catch (error) {
    console.log("Error in updatePet:", error.message);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

exports.getAllVisitByPetId=async(req,res)=>{
     try {
        const visits = await Visit.find({ pet: req.params.petId })
           .sort("-createdAt");

        return res.json({
        success: true,
        message: "Pet fetched Successfully",
        visits
    });
  } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

exports.getAllPetByCustomerId=async(req,res)=>{
    try {
        const { email } = req.body;

         if (!email){
            return res.status(400).json({
                Success: false,
                message: "Customer ID is required"
             });
        }
       
        const owner = await Owner.findOne({email}).populate({path:"pets"});
        

        return res.status(200).json({
            success:true,
            message:"Customer pet fetched successfully",
            pets:owner?.pets
        })

    } catch (error) {
         return res.status(400).json({
            success:false,
            message:"error occured in customer pet fetching controller"
         })
    }
}