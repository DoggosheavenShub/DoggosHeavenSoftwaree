import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { addDayCareVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  PaymentOptionModal,
  PartialPaymentModal,
} from "./PaymentComponents/PaymentModals";
import { PaymentService } from "./PaymentComponents/PaymentService";
import { usePaymentFlow } from "./PaymentComponents/PaymentHooks";

const DayCare = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const [formData, setFormData] = useState(null);
  const [boardingDetails, setBoadringDetails] = useState(null);

  // Initialize payment service
  const paymentService = new PaymentService(backendURL, razorpayKeyId);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      discount: 0,
    },
  });

  const discount = watch("discount");

  const getTotalPrice = () => {
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

    const formDataWithPayment = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        discount: data.discount,
        fullPrice: visitPurposeDetails.price,
        finalPrice: getTotalPrice(),
      },
    };

    console.log("Form data prepared:", formDataWithPayment);
    setFormData(formDataWithPayment);

    if (getTotalPrice() === 0) {
      processVisitSave(formDataWithPayment, "after");
    } else {
      setShowPaymentModal(true);
    }
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
      receipt: `pet_daycare_${_id}`,
      notes: {
        petId: _id,
        visitType: visitPurposeDetails._id,
        paymentType: paymentType,
      },
    };

    let paymentDescription;
    let paymentAmount;
    let remainingPaymentAmount;

    console.log("remamt", remainingAmt);

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
      businessName: "Pet DayCare Service",
      description: paymentDescription,
      themeColor: "#3399cc",
      prefill: {
        name: "",
        email: "",
        contact: "",
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
      dispatch(addDayCareVisit(updatedData));
      alert("Payment successful and visit saved!");
      navigate("/dashboard");
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
      initializeRazorpay("partial", adv, rem);
    });
  };

  const processVisitSave = (data, paymentType) => {
    setIsLoading(true);

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

    const requestBody = {
      petId: data.petId.trim(),
      visitType: data.visitType.trim(),
      discount: data.details?.discount || 0,
      details: {
        price: formData.finalPrice,
        payment: {
          paymentType: paymentType,
          isPaid: false,
          amount: 0,
          paidAt: null,
          remainingAmount: getTotalPrice(),
          isRemainingPaid: false,
        },
      },
    };

    console.log("Saving visit with data:", requestBody);

    dispatch(addDayCareVisit(requestBody))
      .then((result) => {
        console.log("Save result:", result);
        if (result?.payload?.success) {
          alert("Visit saved successfully");
          navigate("/dashboard");
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

  const checkBoarding = async () => {
    const token = localStorage.getItem("authtoken") || "";
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/boarding/checkboarding`,
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id }),
      }
    );

    const data = await response.json();
    console.log(data);

    if (data?.success) {
      setBoadringDetails(data?.boardingDetails);
    } else {
      alert("Error in fetching boarding details");
      navigate("/history");
    }
  };

  useEffect(() => {
    if (_id) {
      checkBoarding();
    }
  }, [_id]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  if (boardingDetails)
    return (
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

        <p className="text-sm" style={{ color: "#85A947" }}>
          The pet is already boarded in {boardingDetails?.boardingType?.purpose}
        </p>
      </div>
    );
 
  return (
    <div className="hidescroller">
      <div className="max-w-full flex justify-center p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 rounded-2xl shadow-2xl w-full space-y-6 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(145deg, #EFE3C2 0%, rgba(239, 227, 194, 0.95) 100%)",
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
              Payment Details
            </h2>
            <div
              className="w-16 h-1 mx-auto rounded-full"
              style={{ backgroundColor: "#85A947" }}
            ></div>
          </div>

          {/* Price and Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Price */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: "#3E7B27" }}
              >
                Original Price
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
                  {...register("discount", {
                    min: 0,
                    valueAsNumber: true,
                  })}
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
            </div>
          </div>

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
              <div className="space-y-1">
                <span
                  className="text-sm font-medium"
                  style={{ color: "#3E7B27" }}
                >
                  Total Amount to Pay:
                </span>
                {register("discount").value > 0 && (
                  <div className="text-xs" style={{ color: "#85A947" }}>
                    Discount Applied: ₹{register("discount").value || 0}
                  </div>
                )}
              </div>
              <div className="text-right">
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
                {getTotalPrice() !== visitPurposeDetails?.price && (
                  <div className="text-sm mt-1" style={{ color: "#85A947" }}>
                    You save: ₹
                    {(visitPurposeDetails?.price || 0) - getTotalPrice()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Button */}
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
                <span>Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
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
              </div>
            )}
          </button>

          {/* Security & Payment Info */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "#85A947" }}
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs" style={{ color: "#85A947" }}>
                Secure Payment
              </span>
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ color: "#85A947" }}
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs" style={{ color: "#85A947" }}>
                SSL Encrypted
              </span>
            </div>
          </div>
        </form>
      </div>

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

export default DayCare;