import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  daySchoolDeboarding,
  getBoardingDetails,
} from "../../store/slices/deboardSlice";

const PlaySchoolDebaord = ({ _id, setboardingid }) => {
  const dispatch = useDispatch();
  const { boardingDetails } = useSelector((state) => state.deboard);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeboard = () => {
    setLoading(true);
    dispatch(daySchoolDeboarding(boardingDetails?._id))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Pet deboarded successfully");
          navigate("/dashboard");
        } else {
          alert("There was an error in deboarding pet");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    dispatch(getBoardingDetails(_id));
  }, []);


  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-11/12 sm:w-1/2 max-w-lg flex flex-col p-8 border border-[#85A947]/20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
          <h2 className="text-2xl font-bold text-[#123524]">
            Boarding Details
          </h2>
        </div>
        <button
          onClick={() => setboardingid("")}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EFE3C2]/50 hover:bg-[#85A947]/20 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
        >
          <svg
            className="w-5 h-5 text-[#123524]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-[#EFE3C2]/40 to-[#85A947]/10 rounded-xl border border-[#85A947]/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#3E7B27] rounded-full"></div>
            <span className="text-[#3E7B27] font-bold text-lg">
              Entry Date:
            </span>
          </div>
          <span className="text-[#123524] font-semibold text-lg">
            {boardingDetails?.entryTime.substring(0, 10)}
          </span>
        </div>

        <div className="flex justify-center pt-4">
          <button
            disabled={loading}
            onClick={handleDeboard}
            className={`px-8 py-4 text-base font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 shadow-lg ${
              loading
                ? "bg-[#123524]/50 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl hover:-translate-y-0.5 focus:ring-red-300"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Deboard Pet</span>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaySchoolDebaord;
