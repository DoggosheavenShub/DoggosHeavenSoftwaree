import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { addVeterinaryVisit } from "../../../store/slices/visitSlice";

import { useNavigate } from "react-router-dom";

import { loadRazorpayScript } from "../../../utils/loadRazorpayScript";

const Veterinary = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [customerType, setCustomerType] = useState("pvtltd");
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [price, setPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (customerType) {
      if (customerType === "pvtltd")
        setPrice(visitPurposeDetails?.consultationPricePvt);
      else if (customerType === "pvtltd Emergency")
        setPrice(visitPurposeDetails?.consultationPricePvtEmergency);
      else if (customerType === "NGO")
        setPrice(visitPurposeDetails?.consultationPriceNgo);
      else setPrice(visitPurposeDetails?.consultationPriceNgoEmergency);
    }
  }, [customerType]);

  useEffect(() => {
    setTotalPrice(price - discount < 0 ? 0 : price - discount);
  }, [price, discount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const startPayment = async (amount) => {
    const data = {};
    data.petId = _id;
    data.visitType = visitPurposeDetails?._id;
    data.customerType = customerType;

    if(!data.petId){
      alert("No Pet Choosen")
      return ;
    } 
    
    if(!data.visitType){
      alert("No Visit Choosen , First Choose a visit .")
      return ;
    } 

    if(!data.customerType){
      alert("Customer Type Not Choosen")
      return ;
    } 

    const razorpayLoaded = await loadRazorpayScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!razorpayLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // 1. Create order on backend
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
          receipt: `Vet Consultation`,
          notes: {
            boardingId: _id,
          },
        }),
      }
    );

    const { order } = await res.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Doggos Heaven",
      description: "Test Transaction",
      order_id: order.id,
      handler: async function (response) {
        // 3. Verify payment on backend
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

        const payment = {
          razorpay_payment_id: response.razorpay_payment_id,
          paidAt: new Date().toISOString(),
          isPaid: true,
          amount,
          remainingAmount: 0,
          isRemainingPaid: true,
        };

        data.payment = payment;


        if (result.success) {
          dispatch(addVeterinaryVisit(data)).then((data) => {
            if (data?.payload?.success) {
              alert("✅ Payment Done Successfully and visit saved");
              navigate("/dashboard")
            } else
              alert(
                `✅ Payment Done Successfully but visit not saved ${data?.payload?.message}`
              );
          });
        } else {
          alert("❌ Payment Failed!");
        }
      },
      theme: { color: "#528FF0" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Veterinary Form
      </h1>

      <form className="space-y-6">
        {/* Customer Type */}
        <div>
          <label className="block font-medium mb-1">Customer Type</label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="pvtltd">Pvt Ltd</option>
            <option value="pvtltd Emergency">Pvt Ltd Emergency</option>
            <option value="NGO">NGO</option>
            <option value="NGO Emergency">NGO Emergency</option>
          </select>
        </div>

        <div className="text-xl font-bold">Consultation Price: ₹ {price}</div>

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
              min={0}
              max={price}
              onWheel={(e) => e.target.blur()}
              onChange={(e) => setDiscount(Number(e.target.value))}
              value={discount}
              className="w-full pl-8 pr-4 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-0"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "2px solid #85A947",
                color: "#123524",
              }}
              placeholder="Enter discount amount"
              onFocus={(e) => {
                e.target.style.borderColor = "#3E7B27";
                e.target.style.boxShadow = "0 0 0 3px rgba(62, 123, 39, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#85A947";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        <div className="text-xl font-bold">Total Price: ₹ {totalPrice}</div>

        <button
          disabled={isLoading}
          onClick={(e) => {
            e.preventDefault(); // ⛔ Prevent form submit
            startPayment(totalPrice); // ✅ Proceed with Razorpay
          }}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Proceed To Payment
        </button>
      </form>
    </div>
  );
};

export default Veterinary;
