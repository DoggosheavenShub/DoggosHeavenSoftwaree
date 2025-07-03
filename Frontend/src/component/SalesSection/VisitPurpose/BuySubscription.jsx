import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import {
  buySubscription,
  getAllSubscription,
} from "../../../store/slices/subscriptionSlice";
import { useDispatch, useSelector } from "react-redux";
import { loadRazorpayScript } from "../../../utils/loadRazorpayScript";

import { PaymentService } from "./PaymentComponents/PaymentService";
import { usePaymentFlow } from "./PaymentComponents/PaymentHooks";
import Navbar from "../../navbar";

const BuySubscription = ({ _id, visitPurposeDetails }) => {
  const { subscriptions } = useSelector((state) => state.subscription);
  const { petDetails } = useSelector((state) => state.pets);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);

  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      planId: "",
    },
  });

  const planId = watch("planId");

  // Initialize payment service
  const paymentService = new PaymentService(backendURL, razorpayKeyId);

  const getTotalPrice = () => {
    return totalPrice(planId);
  };

  // Use payment hook
  const { isLoading, setIsLoading, processPaymentFlow } = usePaymentFlow(
    paymentService,
    getTotalPrice
  );

  const onSubmit = (data) => {
    console.log("Submitting subscription with pet ID:", _id);
    console.log("Visit purpose details ID:", visitPurposeDetails._id);

    if (!_id || _id.trim() === "") {
      console.error("Missing pet ID");
      alert("A pet must be selected. Please select a pet before proceeding.");
      return;
    }

    if (
      !visitPurposeDetails ||
      !visitPurposeDetails._id ||
      visitPurposeDetails._id.trim() === ""
    ) {
      console.error("Missing visit type ID");
      alert("Visit type is missing. Please try again.");
      return;
    }

    if (!data.planId || data.planId.trim() === "") {
      alert("Please select a subscription plan.");
      return;
    }

    const formattedData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      planId: data.planId,
      details: {},
      totalPrice: totalPrice(data.planId),
    };

    console.log("Form data prepared:", formattedData);
    setFormData(formattedData);

    if (totalPrice(data.planId) === 0) {
      processSubscriptionSave(formattedData);
    } else {
      initializeRazorpay(formattedData);
    }
  };

  const initializeRazorpay = (data) => {
    const amount = data.totalPrice;

    const orderData = {
      receipt: `sub_${_id.slice(-15)}`,
      notes: {
        petId: _id,
        visitType: visitPurposeDetails._id,
        planId: data.planId,
        paymentType: "advance",
      },
    };

    const customData = {
      businessName: "Pet Subscription Service",
      description: "Full Payment for Subscription",
      themeColor: "#3399cc",
      prefill: {
        name: petDetails?.owner?.name || "",
        email: petDetails?.owner?.email || "",
        contact: petDetails?.owner?.phone || "",
      },
    };

    const onPaymentSuccess = (response) => {
      const updatedData = {
        ...data,
        details: {
          payment: {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            paymentType: "advance",
            amount: amount,
            paidAt: new Date().toISOString(),
            isPaid: true,
            remainingAmount: 0,
            isRemainingPaid: true,
          },
        },
      };

      handlePaymentSuccess(updatedData, response);
    };

    const onPaymentError = (error) => {
      alert(error);
    };

    processPaymentFlow(
      "advance",
      amount,
      orderData,
      customData,
      onPaymentSuccess,
      onPaymentError
    );
  };

  const handlePaymentSuccess = (updatedData, response) => {
    const paymentData = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      visitData: updatedData,
    };

    const onVerifySuccess = (data) => {
      console.log(data);
      // Format data for subscription dispatch
      const subscriptionData = {
        petId: updatedData.petId,
        visitType: updatedData.visitType,
        planId: updatedData.planId,
        details: updatedData.details,
      };

      dispatch(buySubscription(subscriptionData))
        .then((result) => {
          if (result?.payload?.success) {
            alert("Payment successful and subscription purchased!");
            navigate("/dashboard");
          } else {
            alert(
              result?.payload?.message || "Failed to purchase subscription"
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error purchasing subscription:", error);
          alert("An error occurred: " + error.message);
          setIsLoading(false);
        });
    };

    const onVerifyError = (error) => {
      alert(error);
      setIsLoading(false);
    };

    paymentService.verifyPayment(paymentData, onVerifySuccess, onVerifyError);
  };

  const processSubscriptionSave = (data) => {
    setIsLoading(true);

    console.log("Processing subscription save with data:", data);

    const subscriptionData = {
      petId: data.petId,
      visitType: data.visitType,
      planId: data.planId,
      details: data.details,
    };

    dispatch(buySubscription(subscriptionData))
      .then((result) => {
        if (result?.payload?.success) {
          alert("Subscription purchased successfully!");
          navigate("/dashboard");
        } else {
          alert(result?.payload?.message || "Failed to purchase subscription");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error purchasing subscription:", error);
        alert("An error occurred: " + error.message);
        setIsLoading(false);
      });
  };

  const totalPrice = (id) => {
    if (id) {
      const plan = subscriptions.find((item) => item._id === id);
      return plan?.price;
    }
    return 0;
  };

  useEffect(() => {
    dispatch(getAllSubscription()).then((data) => {
      if (data?.payload?.success) setValue("planId", subscriptions[0]?._id);
    });
  }, [dispatch]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );



  //   <div className="flex items-center justify-center p-4">
  //     <form
  //       onSubmit={handleSubmit(onSubmit)}
  //       className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
  //     >
  //       <h2 className="text-xl font-semibold text-gray-700">Select Plan</h2>

  //       <div>
  //         <select
  //           {...register("planId", {
  //             required: "Please select a plan",
  //           })}
  //           className="w-full p-2 border rounded-lg"
  //         >
  //           <option value="" disabled >
  //             Select Plan
  //           </option>
  //           {subscriptions?.map((item, idx) => {
  //             return item?.duration ? (
  //               <option
  //                 key={idx}
  //                 value={item?._id}
  //               >{`${item.subscriptionType?.purpose} - ${item.duration} days`}</option>
  //             ) : (
  //               <option
  //                 key={idx}
  //                 value={item?._id}
  //               >{`${item.subscriptionType?.purpose} - ${item.numberOfGroomings} groomings`}</option>
  //             );
  //           })}
  //         </select>
  //         {errors.planId && (
  //           <p className="text-red-500 text-sm mt-1">{errors.planId.message}</p>
  //         )}
  //       </div>

  //       {/* Price Details */}
  //       <div className="flex mt-3 items-center space-x-4">
  //         <label className="text-gray-600">Total Price:</label>
  //         <div className="text-lg font-semibold">₹{totalPrice(planId)}</div>
  //       </div>

  //       <button
  //         type="submit"
  //         disabled={isLoading}
  //         className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
  //       >
  //         {totalPrice(planId) === 0 ? "Purchase Subscription" : "Proceed to Payment"}
  //       </button>
  //     </form>
  //   </div>
  // );
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center p-4 min-h-screen bg-gray-50">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg shadow-lg w-full max-w-md space-y-5 bg-white"
        >
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Choose Your Plan
            </h2>
            <div className="w-12 h-1 mx-auto rounded bg-green-500"></div>
          </div>

          {/* Plan Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subscription Plan
            </label>
            <div className="relative">
              <select
                {...register("planId", {
                  required: "Please select a plan",
                })}
                className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none bg-white text-gray-800"
              >
                <option value="" disabled className="text-gray-400">
                  Select your preferred plan
                </option>
                {subscriptions?.map((item, idx) => {
                  return item?.duration ? (
                    <option key={idx} value={item?._id} className="text-gray-800">
                      {`${item.subscriptionType?.purpose} - ${item.duration} days`}
                    </option>
                  ) : (
                    <option key={idx} value={item?._id} className="text-gray-800">
                      {`${item.subscriptionType?.purpose} - ${item.numberOfGroomings} groomings`}
                    </option>
                  );
                })}
              </select>
            </div>
            {errors.planId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planId.message}
              </p>
            )}
          </div>

          {/* Price Details */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                Total Amount:
              </span>
              <span className="text-xl font-bold text-gray-800">
                ₹{totalPrice(planId)}
              </span>
            </div>
            {totalPrice(planId) > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                * Secure payment processing
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : totalPrice(planId) === 0 ? (
              <span>Get Subscription</span>
            ) : (
              <span>Proceed to Payment</span>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-gray-500">Secure & Encrypted</span>
          </div>
        </form>
      </div>
    </>
  );
};

export default BuySubscription;
