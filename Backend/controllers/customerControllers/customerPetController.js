const Visit=require("./../../models/Visit");
const Pet=require("./../../models/Visit");
const Owner=require("../../models/Owner");


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