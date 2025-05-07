import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionDetails } from "../../../store/slices/subscriptionSlice";
import { addGroomingVisit } from "../../../store/slices/visitSlice";

const Grooming = ({ _id, visitPurposeDetails }) => {

  const { isLoading, setIsLoading } = useState(false);
  const dispatch = useDispatch();
  const [planId, setPlanId] = useState("");

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      isSubscriptionAvailed: false,
      discount: 0,
    },
  });

  const navigate = useNavigate();

  const discount = watch("discount");
  const isSubscriptionAvailed = watch("isSubscriptionAvailed");

  const { subscriptionDetails } = useSelector((state) => state.subscription);
  
  const onSubmit = (data) => {
    
    data.petId=_id;
    data.planId=planId
    data.visitType=visitPurposeDetails._id;
  
    
    dispatch(addGroomingVisit(data))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Visit saved successfully");
          reset();
          navigate("/dashboard")
        } else alert(data?.payload?.message);
        setIsLoading(false);
      })
  };
  
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("petId", _id.trim());
    params.append("visitType", visitPurposeDetails._id.trim());

    const queryString = params.toString();
    dispatch(getSubscriptionDetails(queryString));
  }, []);

  const handleAvail = (id) => {
    setPlanId(id);
    setValue("isSubscriptionAvailed", !isSubscriptionAvailed);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="hidescroller">
      {subscriptionDetails ? (
        <div className="mt-3 max-w-full mx-auto p-6  rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            Subscription Details
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Pet Name:</span>
              <span>{subscriptionDetails?.petId?.name}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Owner Name:</span>
              <span>{subscriptionDetails?.petId?.owner?.name}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Number of Groomings left:</span>
              <span>{subscriptionDetails?.numberOfGroomings}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-4">
            <button
              onClick={() => handleAvail(subscriptionDetails?.planId?._id)}
              className="w-1/2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              {isSubscriptionAvailed ? "Not Avail" : "Avail"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 max-w-full mx-auto p-6  rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            The pet has no active subscription for Grooming
          </h2>
        </div>
      )}
      <div className="max-w-full flex justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow-md  w-full space-y-4"
        >
          {/* Discount */}
          {!isSubscriptionAvailed ? (
            <div className="flex w-full items-center justify-between px-5">
              <div>
                <label className="block text-gray-600 mb-1">Price</label>
                <div>{visitPurposeDetails?.price}</div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Discount</label>
                <input
                  type="number"
                  max={visitPurposeDetails?.price}
                  min={0}
                  {...register("discount", { min: 0, valueAsNumber: true })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter discount"
                />
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="flex mt-3 items-center space-x-4">
            <label className="text-gray-600">Total Price:</label>
            <div className="text-lg font-semibold">
              {isSubscriptionAvailed
                ? 0
                : (visitPurposeDetails.price - discount)
                ? (visitPurposeDetails.price - discount) 
                : 0}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Grooming;
