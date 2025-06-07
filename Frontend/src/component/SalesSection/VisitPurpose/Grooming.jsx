// import React, { useEffect, useState } from "react";
// import "../../../App.css";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { getSubscriptionDetails } from "../../../store/slices/subscriptionSlice";
// import { addGroomingVisit } from "../../../store/slices/visitSlice";

// const PaymentOptionModal = ({ isOpen, onClose, onSelectOption, totalPrice }) => {
//   if (!isOpen) return null;

//   const paymentOptions = [
//     { id: "advance", label: "Advance Payment", description: "Pay the full amount now" },
//     { id: "partial", label: "Partial Payment", description: "Pay a portion now and rest later" },
//     { id: "after", label: "Payment After Service", description: "Pay after the service is completed" }
//   ];

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">Select Payment Option</h2>
//         <div className="space-y-3">
//           {paymentOptions.map((option) => (
//             <div 
//               key={option.id}
//               onClick={() => onSelectOption(option.id)}
//               className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition"
//             >
//               <h3 className="font-medium text-lg">{option.label}</h3>
//               <p className="text-gray-600 text-sm">{option.description}</p>
//               {option.id === "advance" && (
//                 <p className="text-sm font-medium mt-1">
//                   Amount: ₹{totalPrice}
//                 </p>
//               )}
//             </div>
//           ))}
//         </div>
//         <button 
//           onClick={onClose}
//           className="mt-4 w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };



// const PartialPaymentModal = ({ isOpen, onClose, onConfirm, totalPrice }) => {
//   const [advanceAmount, setAdvanceAmount] = useState(0);
//   const [remainingAmount, setRemainingAmount] = useState(0);
//   const [error, setError] = useState("");
//   const [isValid, setIsValid] = useState(true);

//   useEffect(() => {
    
//     if (isOpen) {
      
//       const defaultAdvance = Math.round(totalPrice * 0.5);
//       setAdvanceAmount(defaultAdvance);
//       setRemainingAmount(totalPrice - defaultAdvance);
//       setError("");
//       setIsValid(true);
//     }
//   }, [isOpen, totalPrice]);

//   const handleAdvanceChange = (e) => {
//     let value = parseInt(e.target.value) || 0;
//      console.log("val",value);
    
//     const minPayment = Math.round(totalPrice * 0.1);
//     const maxPayment = Math.round(totalPrice * 0.9);
    
    
//     if (value < minPayment) {
//       setError(`Advance payment must be at least ₹${minPayment} (10% of total)`);
//       setIsValid(false);
//     } else if (value > maxPayment) {
//       setError(`Advance payment cannot exceed ₹${maxPayment} (90% of total)`);
//       setIsValid(false);
//     } else {
//       setError("");
//       setIsValid(true);
//     }
    
  
//     const clampedValue = Math.max(Math.min(value, totalPrice), 0);
    

//     setAdvanceAmount(value); 
//     setRemainingAmount(totalPrice - clampedValue); 
//   };

//   const handleSubmit = () => {
//     if (isValid) {
    
//       const minPayment = Math.round(totalPrice * 0.1);
//       const maxPayment = Math.round(totalPrice * 0.9);
      
    
//       const finalAdvance = Math.max(Math.min(advanceAmount, maxPayment), minPayment);
//       const finalRemaining = totalPrice - finalAdvance;
      
//       console.log("Partial payment confirmed:", {
//         advance: finalAdvance,
//         remaining: finalRemaining,
//         total: totalPrice
//       });
      
      
//       onConfirm(finalAdvance, finalRemaining);
//     }
//   };

//   return (
//     <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">Customize Partial Payment</h2>
        
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2 font-medium">Total Price: ₹{totalPrice}</label>
          
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Pay Now:</label>
//             <input
//               type="number"
//               value={advanceAmount}
//               onChange={handleAdvanceChange}
//               className={`w-full p-2 border rounded-lg ${!isValid ? 'border-red-500' : ''}`}
//               min={Math.round(totalPrice * 0.1)}
//               max={Math.round(totalPrice * 0.9)}
//             />
//             <p className="text-xs text-gray-500 mt-1">
//               (Should be between 10% to 90% of total price)
//             </p>
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Pay After Service:</label>
//             <div className="p-2 bg-gray-100 rounded-lg font-medium">₹{remainingAmount}</div>
//           </div>
          
//           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//         </div>
        
//         <div className="flex space-x-3">
//           <button 
//             onClick={onClose}
//             className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
//           >
//             Cancel
//           </button>
//           <button 
//             onClick={handleSubmit}
//             disabled={!isValid}
//             className={`flex-1 py-2 ${!isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition`}
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Grooming = ({ _id, visitPurposeDetails }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
//   const [formData, setFormData] = useState(null);
//   const [paymentOption, setPaymentOption] = useState(null);
//   const [advanceAmount, setAdvanceAmount] = useState(0);
//   const [remainingAmount, setRemainingAmount] = useState(0);
//   const [planId, setPlanId] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [isSubscriptionAvailed, setIsSubscriptionAvailed] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { subscriptionDetails } = useSelector((state) => state.subscription);
//   const backendURL = import.meta.env.VITE_BACKEND_URL;
  
//   useEffect(() => {
  
//     if (!_id || _id.trim() === '') {
//       console.error("Pet ID is missing or empty");
//       return;
//     }
    
//     if (!visitPurposeDetails || !visitPurposeDetails._id || visitPurposeDetails._id.trim() === '') {
//       console.error("Visit purpose details are missing or invalid");
//       return;
//     }
    
//     console.log("Fetching subscription details with pet ID:", _id);
//     console.log("Visit purpose details:", visitPurposeDetails._id);
    
//     const params = new URLSearchParams();
//     params.append("petId", _id.trim());
//     params.append("visitType", visitPurposeDetails._id.trim());

//     const queryString = params.toString();
//     dispatch(getSubscriptionDetails(queryString));
//   }, [_id, visitPurposeDetails, dispatch]);

//   const handleAvail = (id) => {
//     setPlanId(id);
//     setIsSubscriptionAvailed(!isSubscriptionAvailed);
//   };

//   const getTotalPrice = () => {
//     if (isSubscriptionAvailed) return 0;
//     return visitPurposeDetails.price - discount > 0 ? visitPurposeDetails.price - discount : 0;
//   };

//   const handleDiscountChange = (e) => {
//     const value = parseInt(e.target.value) || 0;
//     if (value >= 0 && value <= visitPurposeDetails.price) {
//       setDiscount(value);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     console.log("Submitting form with pet ID:", _id);
//     console.log("Visit purpose details ID:", visitPurposeDetails._id);
    
    
//     if (!_id || _id.trim() === '') {
//       console.error("Missing pet ID");
//       alert("A pet must be selected. Please select a pet before proceeding.");
//       return;
//     }
    
//     if (!visitPurposeDetails || !visitPurposeDetails._id || visitPurposeDetails._id.trim() === '') {
//       console.error("Missing visit type ID");
//       alert("Visit type is missing. Please try again.");
//       return;
//     }
    
    
//     const data = {
//       pet: _id, 
//       visitType: visitPurposeDetails._id, 
//       details: {
//         planId: planId,
//         isSubscriptionAvailed,
//         discount,
//         fullPrice: visitPurposeDetails.price,
//         finalPrice: getTotalPrice()
//       }
//     };
    
//     console.log("Form data prepared:", data);
//     setFormData(data);
    
//     if (isSubscriptionAvailed || getTotalPrice() === 0) {
//       processVisitSave(data, "after"); 
//     } else {
//       setShowPaymentModal(true);
//     }
//   };



//   const handlePartialPaymentConfirm = (advance, remaining) => {
 
  
//   setAdvanceAmount(advance);
//   setRemainingAmount(remaining);
  

  
//   setShowPartialPaymentModal(false);
//   initializeRazorpay("partial", advance, remaining);
//   };

//   const initializeRazorpay = (paymentType, advanceAmt = null, remainingAmt = null) => {
//     let amount;
    
//     if (advanceAmt !== null) {
//       amount = advanceAmt;
//     } else {
//       amount = paymentType === "advance" ? getTotalPrice() : Math.round(getTotalPrice() * 0.5);
//     }

//     if (!window.Razorpay) {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.async = true;
//       script.onload = () => createRazorpayOrder(amount, paymentType,remainingAmount);
//       document.body.appendChild(script);
//     } else {
//       createRazorpayOrder(amount, paymentType,remainingAmount);
//     }
//   };

//   const createRazorpayOrder = (amount, paymentType,advanceAmt = null, remainingAmt = null) => {
//     setIsLoading(true);
    
//     fetch(`${backendURL}/api/v1/payments/create-order`, {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Authorization': localStorage.getItem('authtoken')
//       },
//       body: JSON.stringify({ 
//         amount: amount,
//         receipt: `pet_grooming_${_id}`,
//         notes: {
//           petId: _id,
//           visitType: visitPurposeDetails._id,
//           paymentType: paymentType
//         }
//       })
//     })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`API responded with status: ${response.status}`);
//       }
//       return response.text(); 
//     })
//     .then(responseText => {
//       if (!responseText) {
//         throw new Error('Empty response received from server');
//       }
      
//       try {
//         const data = JSON.parse(responseText);
//         if (data.success) {
//           openRazorpayCheckout(data.order, paymentType,advanceAmount,remainingAmount);
//         } else {
//           alert(data.message || 'Failed to create payment order');
//         }
//       } catch (jsonError) {
//         console.error('Failed to parse JSON:', responseText);
//         throw new Error('Invalid JSON response from server');
//       }
//     })
//     .catch(error => {
//       console.error('Error creating order:', error);
//       alert('Failed to initialize payment. Please try again.');
//     })
//     .finally(() => {
//       setIsLoading(false);
//     });
//   };

//  const openRazorpayCheckout = (orderData, paymentType,advanceAmt = null, remainingAmt = null) => {
//   const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY; 
  
//   if (!razorpayKeyId) {
//     console.error('Razorpay Key is missing');
//     alert('Payment configuration error. Please contact support.');
//     setIsLoading(false);
//     return;
//   }

  
//   let paymentDescription;
//   let paymentAmount;
//   let remainingPaymentAmount;

  
//   if (paymentType === "advance") {
//     paymentDescription = "Full Payment";
//     paymentAmount = getTotalPrice();
//     remainingPaymentAmount = 0;
//   } else if (paymentType === "partial") {
//     paymentAmount = advanceAmt;
//     remainingPaymentAmount = remainingAmt;
//     paymentDescription = `Partial Payment (₹${paymentAmount} now, ₹${remainingPaymentAmount} later)`;
//   } else {
  
//     paymentAmount = 0;
//     remainingPaymentAmount = getTotalPrice();
//     paymentDescription = "Payment After Service";
//   }

  
//   console.log("Payment setup:", {
//     paymentType,
//     paymentAmount,
//     remainingPaymentAmount,
//     totalPrice: getTotalPrice()
//   });

//   const options = {
//     key: razorpayKeyId,
//     amount: orderData.amount,
//     currency: orderData.currency,
//     name: "Pet Grooming Service",
//     description: paymentDescription,
//     order_id: orderData.id,
    
//     method: {
//       netbanking: true,
//       card: true,
//       wallet: true,
//       upi: true,
//       paylater: true
//     },
    
//     config: {
//       display: {
//         blocks: {
//           utib: {
//             name: 'Pay using UPI',
//             instruments: [
//               {
//                 method: 'upi'
//               }
//             ]
//           }
//         },
//         sequence: ['block.utib'],
//         preferences: {
//           show_default_blocks: true
//         }
//       }
//     },
//     handler: function(response) {

//       const updatedData = {
//         ...formData,
//         details: {
//           ...formData.details,
//           payment: {
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_signature: response.razorpay_signature,
//             paymentType: paymentType,
//             amount: paymentAmount, 
//             paidAt: new Date().toISOString(),
//             isPaid: paymentAmount > 0, 
//             remainingAmount: remainingPaymentAmount, 
//             isRemainingPaid: remainingPaymentAmount === 0 
//           }
//         }
//       };
      
      
//       handlePaymentSuccess(updatedData, response);
//     },
//     prefill: {
//       name: subscriptionDetails?.petId?.owner?.name || "",
//       email: subscriptionDetails?.petId?.owner?.email || "",
//       contact: subscriptionDetails?.petId?.owner?.phone || ""
//     },
//     theme: {
//       color: "#3399cc"
//     }
//   };

//   const razorpayInstance = new window.Razorpay(options);
//   razorpayInstance.open();
//   setIsLoading(false);
// };


// const handlePaymentSuccess = (updatedData, response) => {
//   setIsLoading(true);
  
  
//   console.log("Sending payment data to backend:", {
//     paymentType: updatedData.details.payment.paymentType,
//     amount: updatedData.details.payment.amount,
//     remainingAmount: updatedData.details.payment.remainingAmount
//   });
  
  
//   const paymentData = {
//     razorpay_payment_id: response.razorpay_payment_id,
//     razorpay_order_id: response.razorpay_order_id,
//     razorpay_signature: response.razorpay_signature,
//     visitData: updatedData
//   };
  
  
//   fetch(`${backendURL}/api/v1/payments/verify-payment`, {
//     method: 'POST',
//     headers: { 
//       'Content-Type': 'application/json',
//       'Authorization': localStorage.getItem('authtoken'),
//     },
//     body: JSON.stringify(paymentData)
//   })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`API responded with status: ${response.status}`);
//     }
//     return response.json(); 
//   })
//   .then(data => {
//     if (data.success) {
  
//       console.log("Successfully saved visit with payment:", data.data);
//       alert("Payment successful and visit saved!");
//       navigate("/dashboard");
//     } else {
//       alert(data.message || "Payment verification failed");
//     }
//   })
//   .catch(error => {
//     console.error("Error verifying payment:", error);
//     alert("An error occurred during payment verification");
//   })
//   .finally(() => {
//     setIsLoading(false);
//   });
// };

//  const handlePaymentOptionSelect = (option) => {
//   setPaymentOption(option);
//   setShowPaymentModal(false);
  
  
//   if (!formData || !formData.pet || !formData.visitType) {
//     console.error("Missing critical data in formData:", formData);
//     alert("Missing required information. Please try again.");
//     return;
//   }
  
//   if (option === "after") {

//     console.log("Selected payment after service for pet:", formData.pet);
    
//     const updatedData = {
//       ...formData,
//       details: {
//         ...formData.details,
//         payment: {
//           paymentType: "after",
//           amount: 0, 
//           isPaid: false,
//           paidAt: null,
//           remainingAmount: getTotalPrice(), 
//           isRemainingPaid: false
//         }
//       }
//     };
    
  
//     processVisitSave(updatedData, option);
//   } else if (option === "partial") {
    
//     setShowPartialPaymentModal(true);
//   } else {
  
//     initializeRazorpay(option);
//   }
// };

 
// const processVisitSave = (data, paymentType) => {
//   setIsLoading(true);
  
//   console.log("Processing visit save with data:", data);
//   console.log("Pet ID:", data.pet);
//   console.log("Visit Type ID:", data.visitType);

//   if (!data.pet || typeof data.pet !== 'string' || data.pet.trim() === '') {
//     console.error("Invalid pet ID:", data.pet);
//     alert("Invalid pet ID. Please select a pet before proceeding.");
//     setIsLoading(false);
//     return;
//   }
  
//   if (!data.visitType || typeof data.visitType !== 'string' || data.visitType.trim() === '') {
//     console.error("Invalid visit type ID:", data.visitType);
//     alert("Invalid visit type. Please try again.");
//     setIsLoading(false);
//     return;
//   }
  
  
//   const requestBody = {
//     petId: data.pet.trim(),
//     visitType: data.visitType.trim(),
//     discount: data.details.discount || 0,
//     isSubscriptionAvailed: data.details.isSubscriptionAvailed || false,
//     planId: data.details.planId || "",
//     payment: {
//       paymentType: paymentType,
//       isPaid: false,
//       amount: 0,
//       paidAt: null,
//       remainingAmount: getTotalPrice(),
//       isRemainingPaid: false
//     }
//   };
  
//   console.log("Saving visit with data:", requestBody);
  

//   dispatch(addGroomingVisit(requestBody))
//     .then((result) => {
//       console.log("Save result:", result);
//       if (result?.payload?.success) {
//         alert("Visit saved successfully");
//         navigate("/dashboard");
//       } else {
//         alert(result?.payload?.message || "Failed to save visit");
//       }
//       setIsLoading(false);
//     })
//     .catch((error) => {
//       console.error("Error saving visit:", error);
//       alert("An error occurred: " + error.message);
//       setIsLoading(false);
//     });
// };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
//       </div>
//     );
//   }

//   return (
//     <div className="hidescroller">
//       {subscriptionDetails ? (
//         <div className="mt-3 max-w-full mx-auto p-6 rounded-2xl">
//           <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
//             Subscription Details
//           </h2>

//           <div className="space-y-3">
//             <div className="flex justify-between text-gray-600">
//               <span className="font-medium">Pet Name:</span>
//               <span>{subscriptionDetails?.petId?.name}</span>
//             </div>

//             <div className="flex justify-between text-gray-600">
//               <span className="font-medium">Owner Name:</span>
//               <span>{subscriptionDetails?.petId?.owner?.name}</span>
//             </div>

//             <div className="flex justify-between text-gray-600">
//               <span className="font-medium">Number of Groomings left:</span>
//               <span>{subscriptionDetails?.numberOfGroomings}</span>
//             </div>
//           </div>

//           <div className="mt-6 flex justify-between gap-4">
//             <button
//               onClick={() => handleAvail(subscriptionDetails?.planId?._id)}
//               className="w-1/2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
//             >
//               {isSubscriptionAvailed ? "Not Avail" : "Avail"}
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="mt-3 max-w-full mx-auto p-6 rounded-2xl">
//           <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
//             The pet has no active subscription for Grooming
//           </h2>
//         </div>
//       )}
//       <div className="max-w-full flex justify-center">
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white p-6 rounded-lg shadow-md w-full space-y-4"
//         >
          
//           {!isSubscriptionAvailed ? (
//             <div className="flex w-full items-center justify-between px-5">
//               <div>
//                 <label className="block text-gray-600 mb-1">Price</label>
//                 <div>{visitPurposeDetails?.price}</div>
//               </div>
//               <div>
//                 <label className="block text-gray-600 mb-1">Discount</label>
//                 <input
//                   type="number"
//                   max={visitPurposeDetails?.price}
//                   min={0}
//                   value={discount}
//                   onChange={handleDiscountChange}
//                   className="w-full p-2 border rounded-lg"
//                   placeholder="Enter discount"
//                 />
//               </div>
//             </div>
//           ) : null}
//           <div className="flex mt-3 items-center space-x-4">
//             <label className="text-gray-600">Total Price:</label>
//             <div className="text-lg font-semibold">
//               ₹{getTotalPrice()}
//             </div>
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Proceed to Payment
//           </button>
//         </form>
//       </div>
      
  
//       <PaymentOptionModal 
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         onSelectOption={handlePaymentOptionSelect}
//         totalPrice={getTotalPrice()}
//       />

      
//       <PartialPaymentModal 
//         isOpen={showPartialPaymentModal}
//         onClose={() => setShowPartialPaymentModal(false)}
//         onConfirm={handlePartialPaymentConfirm}
//         totalPrice={getTotalPrice()}
//       />
//     </div>
//   );
// };

// export default Grooming;


import React, { useEffect, useState } from "react";
import "../../../App.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionDetails } from "../../../store/slices/subscriptionSlice";
import { addGroomingVisit } from "../../../store/slices/visitSlice";

import { 
  PaymentOptionModal, 
  PartialPaymentModal, 
} from './PaymentComponents/PaymentModals';
import {PaymentService} from './PaymentComponents/PaymentService'
import {usePaymentFlow} from './PaymentComponents/PaymentHooks'

const Grooming = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const [formData, setFormData] = useState(null);
  const [planId, setPlanId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isSubscriptionAvailed, setIsSubscriptionAvailed] = useState(false);

  const { subscriptionDetails } = useSelector((state) => state.subscription);
  
  // Initialize payment service
  const paymentService = new PaymentService(backendURL, razorpayKeyId);

  const getTotalPrice = () => {
    if (isSubscriptionAvailed) return 0;
    return visitPurposeDetails.price - discount > 0 ? visitPurposeDetails.price - discount : 0;
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
  
  useEffect(() => {
    if (!_id || _id.trim() === '') {
      console.error("Pet ID is missing or empty");
      return;
    }
    
    if (!visitPurposeDetails || !visitPurposeDetails._id || visitPurposeDetails._id.trim() === '') {
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
    setIsSubscriptionAvailed(!isSubscriptionAvailed);
  };

  const handleDiscountChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && value <= visitPurposeDetails.price) {
      setDiscount(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    console.log("planid",planId);
    
    const data = {
      petId: _id, 
      visitType: visitPurposeDetails._id, 
      details: {
        planId: planId || null,
        isSubscriptionAvailed,
        discount,
        fullPrice: visitPurposeDetails.price,
        finalPrice: getTotalPrice()
      }
    };
    
    console.log("Form data prepared:", data);
    setFormData(data);
    
    if (isSubscriptionAvailed || getTotalPrice() === 0) {
      processVisitSave(data, "after"); 
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
      receipt: `pet_grooming_${_id}`,
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
      businessName: "Pet Grooming Service",
      description: paymentDescription,
      themeColor: "#3399cc",
      prefill: {
        name: subscriptionDetails?.petId?.owner?.name || "",
        email: subscriptionDetails?.petId?.owner?.email || "",
        contact: subscriptionDetails?.petId?.owner?.phone || ""
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
      // console.log("Successfully saved visit with payment:", data.data);
      dispatch(addGroomingVisit(updatedData));
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
    
    const requestBody = {
      petId: data.petId.trim(),
      visitType: data.visitType.trim(),
      discount: data.details.discount || 0,
      isSubscriptionAvailed: data.details.isSubscriptionAvailed || false,
      planId: data.details.planId || null,
      details : {
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

    dispatch(addGroomingVisit(requestBody))
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="hidescroller">
      {subscriptionDetails ? (
        <div className="mt-3 max-w-full mx-auto p-6 rounded-2xl">
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
        <div className="mt-3 max-w-full mx-auto p-6 rounded-2xl">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
            The pet has no active subscription for Grooming
          </h2>
        </div>
      )}
      <div className="max-w-full flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full space-y-4"
        >
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
                  value={discount}
                  onChange={handleDiscountChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter discount"
                />
              </div>
            </div>
          ) : null}
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

export default Grooming;
