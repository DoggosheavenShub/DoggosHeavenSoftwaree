const Visit=require("./../../models/Visit");
const Pet=require("./../../models/Visit");


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
        const { customerId } = req.body;

         if (!customerId){
            return res.status(400).json({
                Success: false,
                message: "Customer ID is required"
             });
        }
        const pets=await Pet.find({owner:customerId});

        return res.status(200).json({
            Success:true,
            message:"Customer pet fetched successfully",
            pets
        })

    } catch (error) {
         return res.status(400).json({
            success:false,
            message:"error occured in customer pet fetching controller"
         })
    }
}