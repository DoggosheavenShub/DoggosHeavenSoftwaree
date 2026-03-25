const Visit=require("./../../models/Visit");
const Pet=require("../../models/pet");
const Owner=require("../../models/Owner");

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

    const pet = await Pet.create({
      name: name.trim(),
      species: species || "dog",
      breed: breed || "",
      sex,
      color: color || "",
      dob: new Date(dob),
      neutered: neutered || false,
      vaccinations: (vaccinations || []).filter(v => v.name?.trim()),
      registrationDate: registrationDate ? new Date(registrationDate) : new Date(),
      owner: owner._id,
    });

    owner.pets.push(pet._id);
    await owner.save();

    return res.status(201).json({ success: true, message: "Pet registered successfully", pet });
  } catch (error) {
    console.log("Error in registerPet:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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