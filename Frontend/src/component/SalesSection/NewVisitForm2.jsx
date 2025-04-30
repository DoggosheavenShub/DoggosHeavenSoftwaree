import React, { useEffect, useState } from "react";
import { getAllVisitType } from "../../store/slices/visitSlice";
import { useDispatch } from "react-redux";
import Inquiry from "./VisitPurpose/Inquiry";
import DogPark from "./VisitPurpose/DogPark";
import Hostel from "./VisitPurpose/Hostel";
import Grooming from "./VisitPurpose/Grooming";
import DayCare from "./VisitPurpose/DayCare";
import DaySchool from "./VisitPurpose/DaySchool";
import PlaySchool from "./VisitPurpose/PlaySchool";
import Shop from "./VisitPurpose/Shop";
import Veterinary from "./VisitPurpose/Veterinary";
import { useLocation } from "react-router-dom";
import BuySubscription from "./VisitPurpose/BuySubscription";


const NewVisitForm2 = () => {
  const dispatch = useDispatch();
  const [visitTypes, setvisitTypes] = useState([]);
  const [purpose, setPurpose] = useState("Inquiry");
  
  const location=useLocation();
  
  useEffect(() => {
    dispatch(getAllVisitType()).then((data) => {
      if (data?.payload?.success) {
        setvisitTypes(data.payload.visitTypes);
      }
    });
  }, []);

  const { _id } = location?.state || "";
  const showForm = () => {
    const VisitPurposeDetails = visitTypes?.length
      ? visitTypes.find((p) => p.purpose === purpose)
      : null;

    switch (purpose) {
      case "Select":
        return <div>Select a pupose</div>;
      case "Inquiry":
        return <Inquiry _id={_id} visitPurposeDetails={VisitPurposeDetails} />;
      case "Dog Park":
        return <DogPark _id={_id} visitPurposeDetails={VisitPurposeDetails} />;
      case "Veterinary":
        return (
          <Veterinary _id={_id} visitPurposeDetails={VisitPurposeDetails} />
        );
      case "Hostel":
        return <Hostel _id={_id} visitPurposeDetails={VisitPurposeDetails} />;
      case "Day Care":
        return <DayCare _id={_id} visitPurposeDetails={VisitPurposeDetails} />;
      case "Day School":
        return (
          <DaySchool _id={_id} visitPurposeDetails={VisitPurposeDetails} />
        );
      case "Play School":
        return (
          <PlaySchool _id={_id} visitPurposeDetails={VisitPurposeDetails} />
        );
      case "Grooming":
        return <Grooming _id={_id} visitPurposeDetails={VisitPurposeDetails} />;
      case "Shop":
        return <Shop _id={_id} visitPurposeDetails={VisitPurposeDetails} />;
      case "Buy Subscription":
        return <BuySubscription _id={_id} visitPurposeDetails={VisitPurposeDetails}/>  
      default:
        return <div>Invalid Selection</div>;
    }
  };
  return (
    <div className="w-full flex justify-center">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New Visit</h2>
        </div>

        {/* Form */}

        {/* Purpose Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Visit
          </label>
          <select
            value={purpose}
            className="border p-2 rounded w-full"
            onChange={(e) => setPurpose(e.target.value)}
          >
            {visitTypes?.map((item, idx) => (
              <option key={idx} value={item?.purpose}>
                {item?.purpose}
              </option>
            ))}
          </select>
        </div>
        <div>{showForm()}</div>
      </div>
    </div>
  );
};

export default NewVisitForm2;
