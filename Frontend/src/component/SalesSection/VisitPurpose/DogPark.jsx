import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { addDogParkVisit } from "../../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { 
  PaymentOptionModal, 
  PartialPaymentModal, 
} from './PaymentComponents/PaymentModals';
import {PaymentService} from './PaymentComponents/PaymentService'
import {usePaymentFlow} from './PaymentComponents/PaymentHooks'

const DogPark = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const [formData, setFormData] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      discount: 0,
    },
  });

  const discount = watch("discount");

  
  const paymentService = new PaymentService(backendURL, razorpayKeyId);

  const getTotalPrice = () => {
    return visitPurposeDetails?.price - discount > 0 ? visitPurposeDetails?.price - discount : 0;
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
    processPaymentFlow
  } = usePaymentFlow(paymentService, getTotalPrice);

  const onSubmit = (data) => {
    console.log("Submitting form with pet ID:", _id);
    console.log("Visit purpose details ID:", visitPurposeDetails._id);
    
    if (!_id || _id.trim() === '') {
      console.error("Missing pet ID");
      alert("A pet must be selected. Please select a pet before proceeding.");
      return;
    }
    
    if (!visitPurposeDetails || !visitPurposeDetails._id || visitPurposeDetails._id.trim() === '') {
      console.error("Missing visit type ID");
      alert("Visit type is missing. Please try again.");
      return;
    }
    
    const formattedData = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      details: {
        discount: data.discount,
        fullPrice: visitPurposeDetails.price,
        finalPrice: getTotalPrice()
      }
    };
    
    console.log("Form data prepared:", formattedData);
    setFormData(formattedData);
    
    if (getTotalPrice() === 0) {
      processVisitSave(formattedData, "after"); 
    } else {
      setShowPaymentModal(true);
    }
  };

  const initializeRazorpay = (paymentType, advanceAmt = null, remainingAmt = null) => {
    let amount;
    
    if (advanceAmt !== null) {
      amount = advanceAmt;
    } else {
      amount = paymentType === "advance" ? getTotalPrice() : Math.round(getTotalPrice() * 0.5);
    }
    
    const orderData = {
      receipt: `pet_dogpark_${_id}`,
      notes: {
        petId: _id,
        visitType: visitPurposeDetails._id,
        paymentType: paymentType
      }
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
      totalPrice: getTotalPrice()
    });

    const customData = {
      businessName: "Pet Dog Park Service",
      description: paymentDescription,
      themeColor: "#3399cc",
      prefill: {
        name: "",
        email: "",
        contact: ""
      }
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
            isRemainingPaid: remainingPaymentAmount === 0 
          }
        }
      };
      
      handlePaymentSuccess(updatedData, response);
    };

    const onPaymentError = (error) => {
      alert(error);
    };

    processPaymentFlow(paymentType, amount, orderData, customData, onPaymentSuccess, onPaymentError);
  };

  const handlePaymentSuccess = (updatedData, response) => {
    setIsLoading(true);
    
    console.log("Sending payment data to backend:", {
      paymentType: updatedData.details.payment.paymentType,
      amount: updatedData.details.payment.amount,
      remainingAmount: updatedData.details.payment.remainingAmount
    });
    
    const paymentData = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      visitData: updatedData
    };
    
    const onVerifySuccess = (data) => {
      console.log(data);
      // Format data for dog park visit dispatch
      const dogParkData = {
        petId: updatedData.petId,
        visitType: updatedData.visitType,
        discount: updatedData.details.discount,
        details: updatedData.details
      };
      
      dispatch(addDogParkVisit(dogParkData));
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

    if (!data.petId || typeof data.petId !== 'string' || data.petId.trim() === '') {
      console.error("Invalid pet ID:", data.petId);
      alert("Invalid pet ID. Please select a pet before proceeding.");
      setIsLoading(false);
      return;
    }
    
    if (!data.visitType || typeof data.visitType !== 'string' || data.visitType.trim() === '') {
      console.error("Invalid visit type ID:", data.visitType);
      alert("Invalid visit type. Please try again.");
      setIsLoading(false);
      return;
    }
    
    // Format data for dog park visit
    const requestBody = {
      petId: data.petId.trim(),
      visitType: data.visitType.trim(),
      discount: data.details.discount || 0,
      details: {
        payment: {
          paymentType: paymentType,
          isPaid: false,
          amount: 0,
          paidAt: null,
          remainingAmount: getTotalPrice(),
          isRemainingPaid: false
        }
      }
    };
    
    console.log("Saving visit with data:", requestBody);

    dispatch(addDogParkVisit(requestBody))
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
                max={visitPurposeDetails?.price}
                min={0}
                {...register("discount", { min: 0, valueAsNumber: true })}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter discount"
              />
            </div>
          </div>
          <div className="flex mt-3 items-center space-x-4">
            <label className="text-gray-600">Total Price:</label>
            <div className="text-lg font-semibold">
              ₹{getTotalPrice()}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            {getTotalPrice() === 0 ? "Submit" : "Proceed to Payment"}
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

export default DogPark;