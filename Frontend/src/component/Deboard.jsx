import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBoardedPetList,
  getBoardingDetails,
} from "../store/slices/deboardSlice";
import { getBoardingCategoryList } from "../store/slices/visitSlice";

import {
  dogParkDeboarding,
  daySchoolDeboarding,
  playSchoolDeboarding,
  hostelDeboarding,
  dayCareDeboarding,
} from "../store/slices/deboardSlice";
import HostelDeboard from "./Deboard/HostelDeboard";
import DogParkDeboard from "./Deboard/DogParkDeboard";
import DaySchoolDeboard from "./Deboard/DaySchoolDeboard";
import DayCareDebaord from "./Deboard/DayCareDebaord";
import PlaySchoolDeboard from "./Deboard/PlaySchoolDeboard";

const Deboard = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const [options, setOptions] = useState([]);
  const [boardingid, setboardingid] = useState(null);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [show,setshow]=useState(false);

  const boardingDetailsRef = useRef(null);

  const { petsList, petsListLoading } = useSelector((state) => state.deboard);

  useEffect(() => {
    const params = new URLSearchParams();
    if (!selectedOption) return;
    params.append("type", selectedOption?._id);
    const queryString = params.toString();

    dispatch(getBoardedPetList(queryString));
  }, [dispatch, selectedOption]);

  useEffect(() => {
    dispatch(getBoardingCategoryList()).then((data) => {
      if (data?.payload?.success) setOptions(data?.payload?.visitTypes);
    });
  }, []);


  const showDeboardingPopup = (_id) => {
    switch (selectedOption?.purpose) {
      case "Dog Park":
        return (
          <DogParkDeboard _id={_id} setboardingid={setboardingid} />
        );
      case "Day School":
        return (
          <DaySchoolDeboard _id={_id} setboardingid={setboardingid} />
        );
      case "Play School":
        return (
          <PlaySchoolDeboard
            _id={_id}
            setboardingid={setboardingid}
          />
        );
      case "Hostel":
        return (
          <HostelDeboard _id={_id} setboardingid={setboardingid} />
        );
      case "Day Care":
        return (
          <DayCareDebaord _id={_id} setboardingid={setboardingid} />
        );
      default:
        return <div></div>;
    }
  };

  if (petsListLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <>
      {" "}
      {boardingid&&<div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        {boardingid ? showDeboardingPopup(boardingid) : ""}
      </div>}
      <div>
        <h1 className="font-bold text-2xl text-black items-center justify-center max-w-[95%] mx-auto p-2">
          Deboard Pets
        </h1>
        <div className="flex min-h-screen bg-gray-100">
          <div className="w-1/6 p-4 flex flex-col space-y-4">
            {options.map((option) => (
              <button
                key={option._id}
                onClick={() => setSelectedOption(option)}
                className={`py-2 px-4 rounded-lg shadow-md transition-all duration-300 ${
                  selectedOption?.id === option?._id
                    ? "bg-blue-950 text-white"
                    : "bg-white text-blue-950 hover:bg-blue-100"
                }`}
              >
                {option?.purpose}
              </button>
            ))}
          </div>

          <div className="w-5/6 p-4 bg-white rounded-lg shadow-md">
            {selectedOption ? (
              petsList && petsList.length > 0 ? (
                <div className="space-y-4">
                  {petsList.map((pet) => (
                    <div
                      key={pet._id}
                      className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition duration-300"
                    >
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
                        <span>
                          <span className="font-medium text-gray-800">
                            Pet name:
                          </span>{" "}
                          {pet?.petId?.name?.toString()}
                        </span>
                        <span>
                          <span className="font-medium text-gray-800">
                            Owner name:
                          </span>{" "}
                          {pet?.petId?.owner?.name}
                        </span>
                        <span>
                          <span className="font-medium text-gray-800">
                            Phone number:
                          </span>{" "}
                          {pet?.petId?.owner?.phone}
                        </span>
                        <span>
                          <span className="font-medium text-gray-800">
                            Status:
                          </span>{" "}
                          {pet.isBoarded ? "Boarded" : "Not Boarded"}
                        </span>
                      </div>
                      <button
                        onClick={() => setboardingid(pet._id)}
                        disabled={loading}
                        className={`ml-4 px-4 py-1.5 text-sm ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white rounded-md transition`}
                      >
                        {loading ? "Processing..." : "Show Boarding Details"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lg text-gray-500">
                  No pets found for this category
                </p>
              )
            ) : (
              <p className="text-lg text-gray-500">
                Select an option to see content
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Deboard;
