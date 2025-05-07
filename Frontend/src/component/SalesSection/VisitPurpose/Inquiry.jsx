import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addInquiryDetails } from "../../../store/slices/visitSlice";
import { useNavigate } from "react-router-dom";

const Inquiry = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      note: "",
      nextFollowUp: "",
      followUpTime: "",
      followUpPurpose: "",
    },
  });

  const onSubmit = (data) => {
    setIsLoading(true);
    data.petId = _id;
    data.visitType = visitPurposeDetails._id;

    dispatch(addInquiryDetails(data))
      .then((data) => {
        
        if (data?.payload?.success) {
          alert("Visit saved successfully");
          reset();
          navigate("/dashboard");
        } else alert(data?.payload?.message);
        setIsLoading(false);
      })
      .catch(() => {
        alert("Error saving data");
        setIsLoading(false);
      });
  };

  const today = new Date().toISOString().split("T")[0];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
      <textarea
        {...register("note", { required: "Inquiry description is required" })}
        placeholder="Describe the inquiry"
        className="w-full px-4 py-2 border rounded-lg"
        rows="4"
      />
      {errors.note && (
        <p className="text-red-500 text-sm">{errors.note.message}</p>
      )}

      {/* Follow-Up Details */}
      <div className="p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-3">Follow-Up Details</h2>
        <div>
          <label>Follow-up date:</label>
          <input
            {...register("nextFollowUp", {})}
            type="date"
            min={today}
            className="w-full p-2 border rounded-md mb-2"
          />
          {errors.nextFollowUp && (
            <p className="text-red-500 text-sm">
              {errors.nextFollowUp.message}
            </p>
          )}
        </div>
        <div>
          <label>Follow-up time:</label>
          <input
            {...register("followUpTime", {})}
            type="time"
            className="w-full p-2 border rounded-md mb-2"
          />
          {errors.followUpTime && (
            <p className="text-red-500 text-sm">
              {errors.followUpTime.message}
            </p>
          )}
        </div>
        <div>
          <label>Follow-up purpose:</label>
          <input
            {...register("followUpPurpose", {})}
            placeholder="Follow-Up Purpose"
            className="w-full p-2 border rounded-md"
          />
          {errors.followUpPurpose && (
            <p className="text-red-500 text-sm">
              {errors.followUpPurpose.message}
            </p>
          )}
        </div>
      </div>

      {/* Total Price Display */}
      <div className="bg-gray-50 p-4 flex h-20 gap-x-5 items-center rounded-lg">
        <p className="text-sm font-medium text-gray-700">Total Price :</p>
        <p className="text-2xl font-bold text-gray-900">&#x20b9;0</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 rounded-lg text-white bg-blue-600 font-medium"
      >
        Save Visit
      </button>
    </form>
  );
};

export default Inquiry;
