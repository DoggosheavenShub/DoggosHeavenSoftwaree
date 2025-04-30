import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { addDayCareVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const DayCare = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      discount: 0,
    },
  });

  const discount = watch("discount");
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
    data.petId = _id;
    data.visitType = visitPurposeDetails._id;
    setIsLoading(true);
    dispatch(addDayCareVisit(data))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Visit saved successfully");
          navigate("/dashboard");
        } else alert(data?.payload?.message);
      })
      .catch(() => {
        alert("Error saving data");
      }).finally(()=>{
        setIsLoading(false)
      });
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="hidescroller">
      <div className="max-w-full flex justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow-md  w-full space-y-4"
        >
          {/* Discount */}
          <div className="flex w-full items-center justify-between px-5">
            <div>
              <label className="block text-gray-600 mb-1">Price</label>
              <div>{visitPurposeDetails?.price}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Discount</label>
              <input
                type="number"
                {...register("discount", {
                  min: 0,
                  valueAsNumber: true,
                })}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter discount"
              />
            </div>
          </div>
          <div className="flex mt-3 items-center space-x-4">
            <label className="text-gray-600">Total Price:</label>
            <div className="text-lg font-semibold">
              {visitPurposeDetails?.price - discount
                ? visitPurposeDetails?.price - discount
                : 0}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default DayCare;
