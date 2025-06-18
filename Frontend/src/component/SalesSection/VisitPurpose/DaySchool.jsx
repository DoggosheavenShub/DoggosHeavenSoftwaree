import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../../../App.css";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSubscriptionDetails } from "../../../store/slices/subscriptionSlice";
import { addDaySchoolVisit } from "../../../store/slices/visitSlice";



const Hostel = ({ _id, visitPurposeDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY;

  const [planId, setPlanId] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      isSubscriptionAvailed: false,
     
    },
  });

  const isSubscriptionAvailed = watch("isSubscriptionAvailed");

  const { subscriptionDetails } = useSelector((state) => state.subscription);

  

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

 

  const processVisitSave = () => {
    setIsLoading(true);

    const data = {
      petId: _id,
      visitType: visitPurposeDetails._id,
      isSubscriptionAvailed: isSubscriptionAvailed,
      planId: planId,
     
    };

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

    
    const requestBody = {
      petId: data.petId.trim(),
      visitType: data.visitType.trim(),
      isSubscriptionAvailed: data.isSubscriptionAvailed || false,
      planId: data.planId || null,
  
    };

    console.log("Saving visit with data:", requestBody);

  if(requestBody.isSubscriptionAvailed){
          dispatch(addDaySchoolVisit(requestBody))
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
    }else{
      alert("avail subscription then save visit ")
       setIsLoading(false);
      return ;
    }

    
  };



  
  
  return (
    <div
      className="hidescroller p-4"
      style={{
    
        minHeight: "100vh",
      }}
    >
      {subscriptionDetails ? (
        <>
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
                Active Subscription
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
                      <span>Cancel Subscription</span>
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
                      <span>Activate Subscription</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Save Visit Button - Only show when subscription exists */}
          <div className="max-w-full mx-auto" style={{ maxWidth: "600px" }}>
            <button 
              onClick={processVisitSave}
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: isLoading 
                  ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                  : "linear-gradient(135deg, #3E7B27 0%, #123524 100%)",
                boxShadow: "0 4px 15px rgba(18, 53, 36, 0.3)",
              }}
            > 
              {isLoading ? "Saving..." : "Save Visit"}
            </button>
          </div>
        </>
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
              No Active Day School Subscription
            </h2>
            <p className="text-sm" style={{ color: "#85A947" }}>
              This pet doesn't have an active subscription for day school
              services. Buy subscription first.
            </p>
           
          </div>
        </div>
      )}
     
    </div>
  );
};

export default Hostel;