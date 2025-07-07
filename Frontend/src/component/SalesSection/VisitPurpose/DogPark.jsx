import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { addDogParkVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {loadRazorpayScript} from "./../../../utils/loadRazorpayScript"

const DogPark = ({ _id, visitPurposeDetails }) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      discount: 0,
    },
  });

  const discount = watch("discount");

  

  const getTotalPrice = () => {
    return visitPurposeDetails?.price - discount > 0
      ? visitPurposeDetails?.price - discount
      : 0;
  };

  const startPayment = async (amount, visitData) => {
    const razorpayLoaded = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!razorpayLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Create order on backend
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({
          amount: amount,
          receipt: `dogpark:${_id}`,
        }),
      }
    );

    const { order } = await res.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Doggos Heaven",
      description: "Dog Park Visit Payment",
      order_id: order.id,
      handler: async function (response) {
        const verifyRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/verify-payment2`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("authtoken") || "",
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
            }),
          }
        );

        const result = await verifyRes.json();

        if (result.success) {
          saveVisitAfterPayment(visitData);
        } else {
          alert("❌ Payment Failed!");
          setIsLoading(false);
        }
      },
      theme: { color: "#528FF0" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const saveVisitAfterPayment = (visitData) => {
    const requestBody = {
      petId: visitData.petId.trim(),
      visitType: visitData.visitType.trim(),
      discount: visitData.details.discount || 0,
      details: {
        payment: {
          paymentType: "razorpay",
          isPaid: true,
          amount: visitData.details.finalPrice,
          paidAt: new Date().toISOString(),
          remainingAmount: 0,
          isRemainingPaid: true,
        },
      },
    };

    dispatch(addDogParkVisit(requestBody))
      .then((result) => {
        if (result?.payload?.success) {
          alert("✅ Payment Done Successfully! Visit saved.");
          navigate("/staff/dashboard");
          reset();
        } else {
          alert("Payment successful but failed to save visit: " + (result?.payload?.message || "Unknown error"));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        alert("Payment successful but error saving visit: " + error.message);
        setIsLoading(false);
      });
  };



  const validateForm = (data) => {
    
    if (data.discount < 0) {
      alert("Discount cannot be negative");
      return false;
    }

    if (data.discount >= visitPurposeDetails?.price) {
      alert(`Discount cannot exceed service price of ₹${visitPurposeDetails?.price}`);
      return false;
    }

    return true;
  };

  const onSubmit = (data) => {
    console.log("Submitting form with pet ID:", _id);
    console.log("Visit purpose details ID:", visitPurposeDetails._id);

    if (!_id || _id.trim() === "") {
      alert("A pet must be selected. Please select a pet before proceeding.");
      return;
    }

    if (!visitPurposeDetails || !visitPurposeDetails._id || visitPurposeDetails._id.trim() === "") {
      alert("Visit type is missing. Please try again.");
      return;
    }

    
    if (!validateForm(data)) {
      return;
    }

    setIsLoading(true);

    const formattedData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        discount: data.discount,
        fullPrice: visitPurposeDetails.price,
        finalPrice: getTotalPrice(),
      },
    };

    const finalAmount = getTotalPrice();

    startPayment(finalAmount, formattedData);
    
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-6 rounded-lg shadow-md space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Service Payment
            </h2>
            <div className="w-12 h-1 bg-blue-500 mx-auto rounded"></div>
          </div>

          {/* Price Section */}
          <div className="space-y-4">
            {/* Service Price */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Service Price
              </label>
              <div className="bg-gray-100 p-3 rounded-lg text-center">
                <span className="text-lg font-bold text-gray-800">
                  ₹{visitPurposeDetails?.price}
                </span>
              </div>
            </div>

            {/* Discount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Apply Discount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  max={visitPurposeDetails?.price}
                  min={0}
                  step="0.01"
                  {...register("discount", { 
                    min: 0, 
                    max: visitPurposeDetails?.price,
                    valueAsNumber: true 
                  })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter discount amount"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum discount: ₹{visitPurposeDetails?.price}
              </p>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Final Amount:
                </span>
                {discount > 0 && (
                  <p className="text-xs text-blue-600">
                    Discount Applied: ₹{discount || 0}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-800">
                  ₹{getTotalPrice()}
                </span>
                {getTotalPrice() !== visitPurposeDetails?.price && getTotalPrice() > 0 && (
                  <p className="text-sm text-green-600">
                    You save: ₹{(visitPurposeDetails?.price || 0) - getTotalPrice()}
                  </p>
                )}
                {getTotalPrice() === 0 && (
                  <p className="text-sm text-green-600">🎉 Completely Free!</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              <span>
                {getTotalPrice() === 0 ? "Complete Service" : "Proceed to Payment"}
              </span>
            )}
          </button>

          {/* Security Info */}
          <div className="flex justify-center space-x-6 pt-2">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-gray-500">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs text-gray-500">SSL Encrypted</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DogPark;