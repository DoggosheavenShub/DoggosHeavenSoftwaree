import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  buySubscription,
  getAllSubscription,
} from "../../store/slices/subscriptionSlice";
import { useDispatch, useSelector } from "react-redux";
import { loadRazorpayScript } from "../../utils/loadRazorpayScript";

const BuySubscription = () => {
  const { subscriptions } = useSelector((state) => state.subscription);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [userPets, setUserPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      planId: "",
      petId: ""
    },
  });

  const planId = watch("planId");
  const petId = watch("petId");

  // Fetch user's pets
  const fetchUserPets = async () => {
    try {
      if (!user?.email) {
        console.error('User email not found');
        return;
      }

      const encodedEmail = encodeURIComponent(user.email);
      const token = localStorage?.getItem("authtoken") || "";
      
      console.log('Fetching pets for email:', user.email); 
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/customerappointment/getcustomerpets?email=${encodedEmail}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token, 
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User Pets API Response:', data);

      if (data.success) {
        setUserPets(data.pets || []);
        console.log('Pets set:', data.pets);
      } else {
        console.error('API returned error:', data.message);
        setUserPets([]);
      }
    } catch (error) {
      console.error('Error fetching user pets:', error);
      setUserPets([]);
      alert('Error loading pets. Please check console for details.');
    }
  };

   const getTotalPrice = (planId) => {
    if (planId) {
      const plan = subscriptions.find((item) => item._id === planId);
      return plan?.price || 0;
    }
    return 0;
  };

  
  const startPayment = async (formData) => {
    if (isPaymentProcessing) return;
    
    setIsPaymentProcessing(true);
    
    try {
      
      if (!formData.petId) {
        alert("Please select a pet");
        return;
      }
      
      if (!formData.planId) {
        alert("Please select a plan");
        return;
      }

      const amount = getTotalPrice(formData.planId);
      if (amount <= 0) {
        alert("Invalid plan selected");
        return;
      }

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

         const token = localStorage?.getItem("authtoken") || "";

      // Create order on backend
     const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/customer/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
             'Authorization': token,
          },
          body: JSON.stringify(formData),
        }
      );

      console.log(res);

      if (!res.ok) {
        throw new Error('Failed to create payment order');
      }

         const order = await res.json();

      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Doggos Heaven",
        description: "Pet Subscription Purchase",
        order_id: order.id,
       handler: function () {

          window.location.href = order.success_url;

        },
        prefill: {
          email: user.email,
          name: user.name || user.firstName || '',
        },
        theme: { 
          color: "#528FF0" 
        },
       modal: {
          ondismiss: () => {
            window.location.href = order.cancel_url;
          },
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();

    } catch (error) {
      console.error('Error in payment process:', error);
      alert('Error initiating payment. Please try again.');
      setIsPaymentProcessing(false);
    }
  };

  // Handle successful payment
  // const handlePaymentSuccess = async (paymentResponse, formData, amount) => {
  //   try {
  //     // Verify payment on backend
  //     const verifyResponse = await fetch(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/v1/payments/verify-payment2`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: localStorage.getItem("authtoken") || "",
  //         },
  //         body: JSON.stringify({
  //           razorpay_payment_id: paymentResponse.razorpay_payment_id,
  //         }),
  //       }
  //     );

  //     const verifyResult = await verifyResponse.json();

  //     if (verifyResult.success) {
  //       // Prepare subscription data
  //       const subscriptionData = {
  //         email: user.email,
  //         petId: formData.petId,
  //         planId: formData.planId,
  //         payment: {
  //           razorpay_payment_id: paymentResponse.razorpay_payment_id,
  //           paidAt: new Date().toISOString(),
  //           isPaid: true,
  //           amount: amount,
  //           remainingAmount: 0,
  //           isRemainingPaid: true,
  //         }
  //       };

  //       // Purchase subscription
  //       const subscriptionResult = await dispatch(buySubscription(subscriptionData));
        
  //       if (subscriptionResult?.payload?.success) {
  //         alert("✅ Subscription purchased successfully!");
  //         navigate("/dashboard");
  //       } else {
  //         alert(subscriptionResult?.payload?.message || "Failed to purchase subscription");
  //       }
  //     } else {
  //       alert("❌ Payment verification failed!");
  //     }
  //   } catch (error) {
  //     console.error('Error in payment verification:', error);
  //     alert("Error processing payment. Please contact support.");
  //   } finally {
  //     setIsPaymentProcessing(false);
  //   }
  // };

  // Form submission handler
  const onSubmit = (data) => {
    startPayment(data);
  };

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      // Check if user is logged in
      if (!user?.id) {
        alert("Please login to continue");
        navigate("/login");
        return;
      }

      setIsLoading(true);

      try {
        // Fetch user's pets
        await fetchUserPets();
        
        // Fetch all subscriptions
        const subscriptionResult = await dispatch(getAllSubscription());
        if (subscriptionResult?.payload?.success && subscriptionResult?.payload?.data?.length > 0) {
          setValue("planId", subscriptionResult.payload.data[0]._id);
        }
      } catch (error) {
        console.error('Error initializing component:', error);
        alert('Error loading data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, [dispatch, user, navigate, setValue]);

  // Debug logs
  console.log('Current userPets state:', userPets);
  console.log('Selected petId:', petId);
  console.log('Selected planId:', planId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-700">
          Buy Subscription
        </h2>

        {/* Pet Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Pet *
          </label>
          <select
            {...register("petId", {
              required: "Please select a pet",
            })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Pet
            </option>
            {userPets && userPets.length > 0 ? (
              userPets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} - {pet.breed}
                </option>
              ))
            ) : (
              <option disabled>No pets found</option>
            )}
          </select>
          {errors.petId && (
            <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>
          )}
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Plan *
          </label>
          <select
            {...register("planId", {
              required: "Please select a plan",
            })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Plan
            </option>
            {subscriptions?.map((item) => (
              <option key={item._id} value={item._id}>
                {item?.duration
                  ? `${item.subscriptionType?.purpose} - ${item.duration} days`
                  : `${item.subscriptionType?.purpose} - ${item.numberOfGroomings} groomings`}
              </option>
            ))}
          </select>
          {errors.planId && (
            <p className="text-red-500 text-sm mt-1">{errors.planId.message}</p>
          )}
        </div>

        {/* Price Details */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="text-gray-600 font-medium">Total Price:</label>
            <div className="text-lg font-semibold text-green-600">
              ₹{getTotalPrice(planId)}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!petId || !planId || isPaymentProcessing}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isPaymentProcessing ? "Processing Payment..." : "Proceed to Payment"}
        </button>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Secure payment powered by Razorpay</p>
        </div>
      </form>
    </div>
  );
};

export default BuySubscription;