import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionDetails } from "../../../store/slices/subscriptionSlice";
import { addGroomingVisit } from "../../../store/slices/visitSlice";

import { PaymentService } from "./PaymentComponents/PaymentService";
import { usePaymentFlow } from "./PaymentComponents/PaymentHooks";

const Grooming = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const [formData, setFormData] = useState(null);
  const [planId, setPlanId] = useState("");

  const [selectedPayment, setSelectedPayment] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      isSubscriptionAvailed: false,
      discount: 0,
    },
  });

  const isSubscriptionAvailed = watch("isSubscriptionAvailed");
  const discount = watch("discount");
  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const { subscriptionDetails } = useSelector((state) => state.subscription);

  // Initialize payment service
  const paymentService = new PaymentService(backendURL, razorpayKeyId);

  const getTotalPrice = () => {
    if (isSubscriptionAvailed) return 0;
    return visitPurposeDetails.price - discount > 0
      ? visitPurposeDetails.price - discount
      : 0;
  };

  // Use payment hook
  const { isLoading, setIsLoading, processPaymentFlow } = usePaymentFlow(
    paymentService,
    getTotalPrice
  );

  useEffect(() => {
    if (!_id || _id.trim() === "") {
      console.error("Pet ID is missing or empty");
      return;
    }

    if (
      !visitPurposeDetails ||
      !visitPurposeDetails._id ||
      visitPurposeDetails._id.trim() === ""
    ) {
      console.error("Visit purpose details are missing or invalid");
      return;
    }

    console.log("Fetching subscription details with pet ID:", _id);
    console.log("Visit purpose details:", visitPurposeDetails._id);

    const params = new URLSearchParams();
    params.append("petId", _id.trim());
    params.append("visitType", visitPurposeDetails._id.trim());

    const queryString = params.toString();
    dispatch(getSubscriptionDetails(queryString));
  }, [_id, visitPurposeDetails, dispatch]);

  const handleAvail = (id) => {
    setPlanId(id);
    setValue("isSubscriptionAvailed", !isSubscriptionAvailed);
  };

  const onSubmit = () => {
    console.log("Submitting form with pet ID:", _id);
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


    const data = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        planId: planId || null,
        selectedPayment,
        isSubscriptionAvailed: isSubscriptionAvailed,
        discount: discount,
        price: visitPurposeDetails.price,
        finalPrice: getTotalPrice(),
      },
    };

    console.log(data);



    dispatch(addGroomingVisit(data))
      .then((result) => {
        console.log("Save result:", result);
        if (result?.payload?.success) {
          alert("Payment successful and visit saved!");
          navigate("/staff/dashboard");
          reset();
        } else {
          alert(result?.payload?.message || "Failed to save grooming visit");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error saving grooming visit:", error);
        alert("An error occurred: " + error.message);
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="animate-spin h-12 w-12 rounded-full mx-auto"
            style={{
              border: "4px solid rgba(133, 169, 71, 0.3)",
              borderTop: "4px solid #3E7B27",
            }}
          />
          <div className="space-y-2">
            <p className="text-lg font-medium" style={{ color: "#123524" }}>
              Loading Grooming Details
            </p>
            <p className="text-sm" style={{ color: "#85A947" }}>
              Please wait while we fetch your information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showPopup)
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Payment Options
        </h2>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <p className="text-gray-700 mb-4 font-medium">Select Payment Method:</p>

          <div className="space-y-3">
            <button
              onClick={() => handlePaymentSelect('cash')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPayment === 'cash'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPayment === 'cash'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPayment === 'cash' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Cash Payment</span>
              </div>
            </button>

            <button
              onClick={() => handlePaymentSelect('payment_link')}
              className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${selectedPayment === 'payment_link'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${selectedPayment === 'payment_link'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                  }`}>
                  {selectedPayment === 'payment_link' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="font-medium">Payment Link</span>
              </div>
            </button>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-700">
              {`I confirm that the payment of ₹ ${getTotalPrice()} has been completed`}
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPopup(false)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${selectedPayment && isConfirmed
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>)

  return (
    <div
      className="hidescroller p-4"
      style={{
        minHeight: "100vh",
      }}
    >
      {subscriptionDetails ? (
        <div
          className="mt-3 max-w-full mx-auto p-8 rounded-2xl shadow-xl mb-6"
          style={{
            border: "1px solid rgba(133, 169, 71, 0.3)",
            maxWidth: "600px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "#123524" }}
            >
              Grooming Subscription
            </h2>
            <div
              className="w-16 h-1 mx-auto rounded-full"
              style={{ backgroundColor: "#85A947" }}
            ></div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-4">
            <div
              className="flex justify-between items-center p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(133, 169, 71, 0.1)",
                border: "1px solid rgba(133, 169, 71, 0.2)",
              }}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "#3E7B27" }}
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium" style={{ color: "#3E7B27" }}>
                  Pet Name:
                </span>
              </div>
              <span className="font-semibold" style={{ color: "#123524" }}>
                {subscriptionDetails?.petId?.name}
              </span>
            </div>

            <div
              className="flex justify-between items-center p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(133, 169, 71, 0.1)",
                border: "1px solid rgba(133, 169, 71, 0.2)",
              }}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "#3E7B27" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium" style={{ color: "#3E7B27" }}>
                  Owner Name:
                </span>
              </div>
              <span className="font-semibold" style={{ color: "#123524" }}>
                {subscriptionDetails?.petId?.owner?.name}
              </span>
            </div>

            <div
              className="flex justify-between items-center p-4 rounded-xl"
              style={{
                backgroundColor: "rgba(18, 53, 36, 0.1)",
                border: "1px solid rgba(133, 169, 71, 0.2)",
              }}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "#3E7B27" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium" style={{ color: "#3E7B27" }}>
                  Groomings Left:
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="font-bold text-xl"
                  style={{ color: "#123524" }}
                >
                  {subscriptionDetails?.numberOfGroomings}
                </span>
                <span className="text-sm" style={{ color: "#85A947" }}>
                  sessions
                </span>
              </div>
            </div>
          </div>

          {/* Avail Button */}
          <div className="mt-6">
            <button
              onClick={() => handleAvail(subscriptionDetails?.planId?._id)}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isSubscriptionAvailed
                  ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                  : "linear-gradient(135deg, #3E7B27 0%, #123524 100%)",
                boxShadow: "0 4px 15px rgba(18, 53, 36, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (isSubscriptionAvailed) {
                  e.target.style.background =
                    "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)";
                } else {
                  e.target.style.background =
                    "linear-gradient(135deg, #123524 0%, #3E7B27 100%)";
                }
              }}
              onMouseLeave={(e) => {
                if (isSubscriptionAvailed) {
                  e.target.style.background =
                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
                } else {
                  e.target.style.background =
                    "linear-gradient(135deg, #3E7B27 0%, #123524 100%)";
                }
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                {isSubscriptionAvailed ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Cancel Grooming Session</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Use Grooming Session</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div
          className="mt-3 max-w-full mx-auto p-8 rounded-2xl shadow-xl mb-6 text-center"
          style={{
            border: "1px solid rgba(133, 169, 71, 0.3)",
            maxWidth: "600px",
          }}
        >
          <div className="flex flex-col items-center space-y-4">
            <svg
              className="w-16 h-16"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{ color: "#85A947" }}
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-xl font-semibold" style={{ color: "#123524" }}>
              No Active Grooming Subscription
            </h2>
            <p className="text-sm" style={{ color: "#85A947" }}>
              This pet doesn't have an active subscription for grooming services
            </p>
          </div>
        </div>
      )}

      {/* Grooming Form */}
      <div className="max-w-full flex justify-center">
        <form
          
          className="p-8 rounded-2xl shadow-2xl w-full space-y-6 backdrop-blur-sm"
          style={{
            border: "1px solid rgba(133, 169, 71, 0.3)",
            maxWidth: "600px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "#123524" }}
            >
              Grooming Services
            </h2>
            <div
              className="w-16 h-1 mx-auto rounded-full"
              style={{ backgroundColor: "#85A947" }}
            ></div>
          </div>

          {/* Conditional Pricing Section */}
          {!isSubscriptionAvailed ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Price */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "#3E7B27" }}
                >
                  Grooming Price
                </label>
                <div
                  className="p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: "rgba(133, 169, 71, 0.1)",
                    border: "2px solid rgba(133, 169, 71, 0.3)",
                  }}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: "#85A947" }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className="text-lg font-bold"
                      style={{ color: "#123524" }}
                    >
                      ₹{visitPurposeDetails?.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discount Input */}
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "#3E7B27" }}
                >
                  Apply Discount
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium"
                    style={{ color: "#85A947" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    max={visitPurposeDetails?.price}
                    min={0}
                    {...register("discount", { min: 0, valueAsNumber: true })}
                    className="w-full pl-8 pr-4 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "2px solid #85A947",
                      color: "#123524",
                    }}
                    placeholder="Enter discount amount"
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3E7B27";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(62, 123, 39, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#85A947";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div className="text-xs" style={{ color: "#85A947" }}>
                  Maximum discount: ₹{visitPurposeDetails?.price}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-6 rounded-xl text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(62, 123, 39, 0.1) 0%, rgba(133, 169, 71, 0.1) 100%)",
                border: "2px solid rgba(133, 169, 71, 0.3)",
              }}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "#3E7B27" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  className="text-lg font-bold"
                  style={{ color: "#123524" }}
                >
                  Subscription Active
                </span>
              </div>
              <p className="text-sm" style={{ color: "#85A947" }}>
                This grooming session is covered by your active subscription
              </p>
            </div>
          )}

          {/* Total Price Display */}
          <div
            className="p-6 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(18, 53, 36, 0.05) 0%, rgba(133, 169, 71, 0.05) 100%)",
              border: "2px solid rgba(133, 169, 71, 0.3)",
            }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-sm font-medium"
                style={{ color: "#3E7B27" }}
              >
                Total Amount:
              </span>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{ color: "#123524" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#123524" }}
                >
                  ₹{getTotalPrice()}
                </span>
              </div>
            </div>
            {getTotalPrice() === 0 && (
              <div
                className="mt-2 text-xs text-center"
                style={{ color: "#85A947" }}
              >
                🎉 Free with your subscription!
              </div>
            )}
            {getTotalPrice() !== visitPurposeDetails?.price &&
              getTotalPrice() > 0 && (
                <div
                  className="mt-2 text-xs text-center"
                  style={{ color: "#85A947" }}
                >
                  You save: ₹
                  {(visitPurposeDetails?.price || 0) - getTotalPrice()}
                </div>
              )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              background: isLoading
                ? "linear-gradient(135deg, #85A947 0%, #3E7B27 100%)"
                : "linear-gradient(135deg, #3E7B27 0%, #123524 100%)",
              boxShadow: "0 4px 15px rgba(18, 53, 36, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background =
                  "linear-gradient(135deg, #123524 0%, #3E7B27 100%)";
                e.target.style.boxShadow = "0 6px 20px rgba(18, 53, 36, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background =
                  "linear-gradient(135deg, #3E7B27 0%, #123524 100%)";
                e.target.style.boxShadow = "0 4px 15px rgba(18, 53, 36, 0.3)";
              }
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
              <div className="flex items-center justify-center space-x-2" onClick={()=>setShowPopup(true)}>
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Book Grooming</span>
                </>

              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Grooming;