const mongoose=require("mongoose");

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		phone: {
			type: String,
			default: "",
		},
		role:{
            type:String,
            required:true,
            enum:["staff","admin","customer"],
            default:"staff"
        },
	},{timestamps:true}
);

const User = mongoose.model("User", userSchema);

module.exports=User