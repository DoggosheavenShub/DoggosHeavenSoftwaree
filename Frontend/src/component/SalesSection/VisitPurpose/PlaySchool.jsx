import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionDetails } from "../../../store/slices/subscriptionSlice";
import { addPlaySchoolVisit } from "../../../store/slices/visitSlice";

import {
  PaymentOptionModal,
  PartialPaymentModal,
} from "./PaymentComponents/PaymentModals";
import { PaymentService } from "./PaymentComponents/PaymentService";
import { usePaymentFlow } from "./PaymentComponents/PaymentHooks";

const PlaySchool = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const [planId, setPlanId] = useState("");
  const [formData, setFormData] = useState(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      isSubscriptionAvailed: false,
      discount: 0,
    },
  });

  const discount = watch("discount");
  const isSubscriptionAvailed = watch("isSubscriptionAvailed");

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
  const {
    isLoading,
    setIsLoading,
    showPaymentModal,
    setShowPaymentModal,
    showPartialPaymentModal,
    setShowPartialPaymentModal,
    paymentOption,
    advanceAmount,
    remainingAmount,
    handlePartialPaymentConfirm,
    handlePaymentOptionSelect,
    processPaymentFlow,
  } = usePaymentFlow(paymentService, getTotalPrice);

  const onSubmit = (data) => {
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

    console.log("planid", planId);

    const formattedData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        planId: planId || null,
        isSubscriptionAvailed: data.isSubscriptionAvailed,
        discount: data.discount,
        fullPrice: visitPurposeDetails.price,
        finalPrice: getTotalPrice(),
      },
    };

    console.log("Form data prepared:", formattedData);
    setFormData(formattedData);

    if (isSubscriptionAvailed) {
      processVisitSave(formattedData, "subscriptionAvailed");
    } else if (getTotalPrice() === 0) {
      processVisitSave(formattedData, "after");
    } else {
      setShowPaymentModal(true);
    }
  };

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

  const initializeRazorpay = (
    paymentType,
    advanceAmt = null,
    remainingAmt = null
  ) => {
    let amount;

    if (advanceAmt !== null) {
      amount = advanceAmt;
    } else {
      amount =
        paymentType === "advance"
          ? getTotalPrice()
          : Math.round(getTotalPrice() * 0.5);
    }

    const orderData = {
      receipt: `pet_playschool_${_id}`,
      notes: {
        petId: _id,
        visitType: visitPurposeDetails._id,
        paymentType: paymentType,
      },
    };

    let paymentDescription;
    let paymentAmount;
    let remainingPaymentAmount;

    if (paymentType === "advance") {
      paymentDescription = "Full Payment";
      paymentAmount = getTotalPrice();
      remainingPaymentAmount = 0;
    } else if (paymentType === "partial") {
      paymentAmount = advanceAmt;
      remainingPaymentAmount = remainingAmt;
      paymentDescription = `Partial Payment (₹${paymentAmount} now, ₹${remainingPaymentAmount} later)`;
    } else {
      paymentAmount = 0;
      remainingPaymentAmount = getTotalPrice();
      paymentDescription = "Payment After Service";
    }

    console.log("Payment setup:", {
      paymentType,
      paymentAmount,
      remainingPaymentAmount,
      totalPrice: getTotalPrice(),
    });

    const customData = {
      businessName: "Pet Play School Service",
      description: paymentDescription,
      themeColor: "#3399cc",
      prefill: {
        name: subscriptionDetails?.petId?.owner?.name || "",
        email: subscriptionDetails?.petId?.owner?.email || "",
        contact: subscriptionDetails?.petId?.owner?.phone || "",
      },
    };

    const onPaymentSuccess = (response) => {
      const updatedData = {
        ...formData,
        details: {
          ...formData.details,
          payment: {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            paymentType: paymentType,
            amount: paymentAmount,
            paidAt: new Date().toISOString(),
            isPaid: paymentAmount > 0,
            remainingAmount: remainingPaymentAmount,
            isRemainingPaid: remainingPaymentAmount === 0,
          },
        },
      };

      handlePaymentSuccess(updatedData, response);
    };

    const onPaymentError = (error) => {
      alert(error);
    };

    processPaymentFlow(
      paymentType,
      amount,
      orderData,
      customData,
      onPaymentSuccess,
      onPaymentError
    );
  };

  const handlePaymentSuccess = (updatedData, response) => {
    setIsLoading(true);

    console.log("Sending payment data to backend:", {
      paymentType: updatedData.details.payment.paymentType,
      amount: updatedData.details.payment.amount,
      remainingAmount: updatedData.details.payment.remainingAmount,
    });

    const paymentData = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      visitData: updatedData,
    };

    const onVerifySuccess = (data) => {
      console.log(data);
      // Format data for day school visit dispatch
      const playSchoolData = {
        petId: updatedData.petId,
        visitType: updatedData.visitType,
        planId: updatedData.details.planId,
        isSubscriptionAvailed: updatedData.details.isSubscriptionAvailed,
        discount: updatedData.details.discount,
        details: updatedData.details,
      };

      dispatch(addPlaySchoolVisit(playSchoolData));
      alert("Payment successful and visit saved!");
      navigate("/dashboard");
      reset();
      setIsLoading(false);
    };

    const onVerifyError = (error) => {
      alert(error);
      setIsLoading(false);
    };

    paymentService.verifyPayment(paymentData, onVerifySuccess, onVerifyError);
  };

  const onPaymentOptionSelect = (option) => {
    handlePaymentOptionSelect(
      option,
      formData,
      processVisitSave, // onAfterPayment
      () => {}, // onPartialPayment
      initializeRazorpay // onAdvancePayment
    );
  };

  const onPartialPaymentConfirm = (advance, remaining) => {
    handlePartialPaymentConfirm(advance, remaining, (adv, rem) => {
      console.log("rem", rem);
      initializeRazorpay("partial", adv, rem);
    });
  };

  const processVisitSave = (data, paymentType) => {
    setIsLoading(true);

    console.log("Processing visit save with data:", data);
    console.log("Pet ID:", data.petId);
    console.log("Visit Type ID:", data.visitType);

    if (
      !data.petId ||
      typeof data.petId !== "string" ||
      data.petId.trim() === ""
    ) {
      console.error("Invalid pet ID:", data.petId);
      alert("Invalid pet ID. Please select a pet before proceeding.");
      setIsLoading(false);
      return;
    }

    if (
      !data.visitType ||
      typeof data.visitType !== "string" ||
      data.visitType.trim() === ""
    ) {
      console.error("Invalid visit type ID:", data.visitType);
      alert("Invalid visit type. Please try again.");
      setIsLoading(false);
      return;
    }

    // Format data similar to grooming but keep day school specific fields
    const requestBody = {
      petId: data.petId.trim(),
      visitType: data.visitType.trim(),
      discount: data.details.discount || 0,
      isSubscriptionAvailed: data.details.isSubscriptionAvailed || false,
      planId: data.details.planId || null,
      details: {
        payment: {
          paymentType: paymentType,
          isPaid: false,
          amount: 0,
          paidAt: null,
          remainingAmount: getTotalPrice(),
          isRemainingPaid: paymentType === "after" ? false : true,
        },
      },
    };

    console.log("Saving visit with data:", requestBody);

    dispatch(addPlaySchoolVisit(requestBody))
      .then((result) => {
        console.log("Save result:", result);
        if (result?.payload?.success) {
          alert("Visit saved successfully");
          navigate("/dashboard");
          reset();
        } else {
          alert(result?.payload?.message || "Failed to save visit");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error saving visit:", error);
        alert("An error occurred: " + error.message);
        setIsLoading(false);
      });
  };

 
  if (isLoading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
       
      >
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
              Loading Play School Details
            </p>
            <p className="text-sm" style={{ color: "#85A947" }}>
              Please wait while we fetch your information...
            </p>
          </div>
        </div>
      </div>
    );

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
              Play School Subscription
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
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium" style={{ color: "#3E7B27" }}>
                  Days Left:
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className="font-bold text-xl"
                  style={{ color: "#123524" }}
                >
                  {subscriptionDetails?.daysLeft}
                </span>
                <span className="text-sm" style={{ color: "#85A947" }}>
                  days
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
                    <span>Cancel Play School</span>
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
                    <span>Join Play School</span>
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
              No Active Play School Subscription
            </h2>
            <p className="text-sm" style={{ color: "#85A947" }}>
              This pet doesn't have an active subscription for play school
              activities
            </p>
          </div>
        </div>
      )}

      {/* Play School Form */}
      <div className="max-w-full flex justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
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
              Play School Services
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
                  Play School Price
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
                Play school activities are covered by your active subscription
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
              <div className="flex items-center justify-center space-x-2">
                {getTotalPrice() === 0 ? (
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
                    <span>Enroll in Play School</span>
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>Proceed to Payment</span>
                  </>
                )}
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Payment Modals using modular components */}
      <PaymentOptionModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectOption={onPaymentOptionSelect}
        totalPrice={getTotalPrice()}
      />

      <PartialPaymentModal
        isOpen={showPartialPaymentModal}
        onClose={() => setShowPartialPaymentModal(false)}
        onConfirm={onPartialPaymentConfirm}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
};

export default PlaySchool;
