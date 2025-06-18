import { useState, useEffect } from "react";
import SubscriptionPopup from "./SubscriptionPopup";

import VaccinationPopup from "./VaccinationPopup";
import PrescriptionPopup from "./PrescriptionPopup";

import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  filterPetsByNameAndPhone,
  getPetDetails,
} from "../../store/slices/petSlice";
import "../../App.css";
import EditPetInfo from "./EditPetInfo";
import EditOwnerInfo from "./EditOwnerDetails";
import PetVisitsPopup from "./PetVisit";

const DogHistory = () => {
  const { petList, getPetListLoading, petDetails, petDetailsLoading } =
    useSelector((state) => state.pets);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isOpenVacc, setIsOpenVacc] = useState(false);
  const [isOpenSub, setIsOpenSub] = useState(false);
  const [isOpenVisit, setIsOpenVisit] = useState(false);
  const [isOpenPrescription, setIsOpenPrescription] = useState(false);

  const [editPet, seteditPet] = useState(false);
  const [editownerinfo, seteditownerinfo] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timeout = setTimeout(() => {
      const params = new URLSearchParams();
      params.append("name", name.trim());
      params.append("phone", phone.trim());
      const queryString = params.toString();

      dispatch(filterPetsByNameAndPhone(queryString)).then((data) => {});
    }, 1000);
    return () => clearTimeout(timeout);
  }, [name, phone, dispatch]);

  const navigateToVisit = (_id) => {
    navigate(`/nvisit2`, { state: { _id } });
  };

  const navigateToPrescription = (_id) => {
    navigate(`/prescription`, { state: { _id } });
  };

  const fetchDogDetails = async (id) => {
    dispatch(getPetDetails(id)).then((data) => {});
  };

  if (getPetListLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  if (isOpenVisit) {
    return (
      <PetVisitsPopup
        petId={petDetails?._id}
        isOpenVisit={isOpenVisit}
        setIsOpenVisit={setIsOpenVisit}
      />
    );
  }

  if (isOpenSub) {
    return (
      <SubscriptionPopup
        isOpen={isOpenSub}
        onClose={() => setIsOpenSub(false)}
        petId={petDetails?._id}
      />
    );
  }

  if (isOpenVacc) {
    return (
      <VaccinationPopup
        isOpen={isOpenVacc}
        onClose={() => setIsOpenVacc(false)}
        vaccinations={petDetails.vaccinations || []}
      />
    );
  }

  if (isOpenPrescription) {
    return (
      <PrescriptionPopup
        isOpen={isOpenPrescription}
        onClose={() => setIsOpenPrescription(false)}
        petId={petDetails?._id}
      />
    );
  }

  return (
    <div className="container w-screen mx-auto p-4 min-h-screen bg-gradient-to-br from-[#FFFFFF] to-[#85A947]/10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#123524] flex items-center gap-3">
          <div className="w-2 h-10 bg-gradient-to-b from-[#3E7B27] to-[#85A947] rounded-full"></div>
          Pet Records
          <div className="w-2 h-10 bg-gradient-to-b from-[#85A947] to-[#3E7B27] rounded-full"></div>
        </h1>

        <Link to="/pet">
          <button className="py-3 px-6 border-2 border-[#3E7B27] rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-[#123524] to-[#3E7B27] hover:from-[#3E7B27] hover:to-[#85A947] focus:outline-none focus:ring-4 focus:ring-[#85A947]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            Add Pet
          </button>
        </Link>
      </div>

      <div className="grid mt-5 grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pet List */}
        <div className="md:col-span-1">
          <div className="w-full flex justify-between gap-3 mb-5">
            <div className="relative w-[49%]">
              <input
                type="text"
                value={name}
                placeholder="Pet name"
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:ring-4 focus:ring-[#85A947]/20 focus:border-[#3E7B27] bg-white/90 backdrop-blur-sm placeholder-[#123524]/60 text-[#123524] font-medium transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
            </div>
            <div className="relative w-[49%]">
              <input
                type="text"
                placeholder="Phone No."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:ring-4 focus:ring-[#85A947]/20 focus:border-[#3E7B27] bg-white/90 backdrop-blur-sm placeholder-[#123524]/60 text-[#123524] font-medium transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl h-[150vh] overflow-y-scroll hidescroller shadow-2xl p-6 border border-[#85A947]/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
              <h2 className="text-2xl font-bold text-[#123524]">All Pets</h2>
            </div>

            <div className="space-y-3">
              {petList?.map((dog) => (
                <button
                  key={dog._id}
                  onClick={() => fetchDogDetails(dog._id)}
                  className="w-full text-left p-5 hover:bg-[#FFFFFF]/50 rounded-xl transition-all duration-300 border-2 border-[#85A947]/10 hover:border-[#3E7B27]/40 hover:shadow-lg hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-[#123524] text-lg group-hover:text-[#3E7B27] transition-colors duration-200">
                        {dog.name}
                      </p>
                      <p className="text-sm text-[#3E7B27] font-medium mt-1">
                        {dog.breed || dog.species}
                        {dog.owner && (
                          <span className="text-[#123524]/70">
                            {` - Owner: ${dog.owner.name}`}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-[#85A947] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pet Details */}
        <div className="md:col-span-2">
          {petDetails ? (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-[#85A947]/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-5 h-5 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
                <h2 className="text-4xl font-bold text-[#123524]">
                  {petDetails.name}
                </h2>
              </div>

              {/* Pet Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {petDetails.species && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg">
                    <p className="font-bold text-[#3E7B27] mb-1">Species</p>
                    <p className="text-[#123524] font-medium">
                      {petDetails.species}
                    </p>
                  </div>
                )}

                {petDetails.breed && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg">
                    <p className="font-bold text-[#3E7B27] mb-1">Breed</p>
                    <p className="text-[#123524] font-medium">
                      {petDetails.breed}
                    </p>
                  </div>
                )}

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg">
                  <p className="font-bold text-[#3E7B27] mb-1">Sex</p>
                  <p className="text-[#123524] font-medium">{petDetails.sex}</p>
                </div>

                {petDetails.color && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg">
                    <p className="font-bold text-[#3E7B27] mb-1">Color</p>
                    <p className="text-[#123524] font-medium">
                      {petDetails.color}
                    </p>
                  </div>
                )}

                {petDetails.dob && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg">
                    <p className="font-bold text-[#3E7B27] mb-1">
                      Date of Birth
                    </p>
                    <p className="text-[#123524] font-medium">
                      {new Date(petDetails.dob).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg">
                  <p className="font-bold text-[#3E7B27] mb-1">Neutered</p>
                  <p className="text-[#123524] font-medium">
                    {petDetails?.neutered ? "Yes" : "No"}
                  </p>
                </div>

                {petDetails?.vaccinations &&
                  petDetails?.vaccinations.length > 0 && (
                    <div
                      className="p-5 rounded-xl bg-gradient-to-br from-[#85A947]/20 to-[#FFFFFF]/50 hover:from-[#85A947]/30 hover:to-[#FFFFFF] transition-all duration-300 border border-[#85A947]/30 hover:border-[#3E7B27]/60 hover:shadow-lg cursor-pointer group"
                      onClick={() => setIsOpenVacc(true)}
                    >
                      <p className="font-bold text-[#3E7B27] mb-1 group-hover:text-[#123524] transition-colors duration-200">
                        Vaccinations
                      </p>
                      <p className="text-[#123524]/70 text-sm font-medium">
                        Click to view details
                      </p>
                    </div>
                  )}

                <div
                  className="p-5 rounded-xl bg-gradient-to-br from-[#85A947]/20 to-[#FFFFFF]/50 hover:from-[#85A947]/30 hover:to-[#FFFFFF] transition-all duration-300 border border-[#85A947]/30 hover:border-[#3E7B27]/60 hover:shadow-lg cursor-pointer group"
                  onClick={() => setIsOpenSub(true)}
                >
                  <p className="font-bold text-[#3E7B27] mb-1 group-hover:text-[#123524] transition-colors duration-200">
                    Subscriptions
                  </p>
                  <p className="text-[#123524]/70 text-sm font-medium">
                    Click to view details
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg flex items-center justify-center">
                  <button
                    onClick={() => setIsOpenVisit(true)}
                    className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-6 py-3 rounded-xl text-white font-semibold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                  >
                    View Visits
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg flex items-center justify-center">
                  <button
                    onClick={() => setIsOpenPrescription(true)}
                    className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-6 py-3 rounded-xl text-white font-semibold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                  >
                    View Vet History
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg flex items-center justify-center">
                  <button
                    onClick={() => navigateToPrescription(petDetails?._id)}
                    className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-6 py-3 rounded-xl text-white font-semibold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                  >
                    Add Prescription
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg flex items-center justify-center">
                  <button
                    onClick={() => navigateToVisit(petDetails?._id)}
                    className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-6 py-3 rounded-xl text-white font-semibold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                  >
                    Add Visit
                  </button>
                </div>

                {/* Popup Component */}

                <div className="p-5 rounded-xl bg-gradient-to-br from-[#FFFFFF]/50 to-white hover:from-[#FFFFFF] hover:to-[#FFFFFF]/30 transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-lg flex items-center justify-center">
                  <button
                    onClick={() => seteditPet(!editPet)}
                    className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-6 py-3 rounded-xl text-white font-semibold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                  >
                    Edit Pet Details
                  </button>
                </div>
              </div>

              {editPet ? <EditPetInfo pet={petDetails} /> : ""}

              {/* Owner Details Section */}
              {petDetails.owner && (
                <div className="mt-8 p-6 bg-gradient-to-br from-[#85A947]/10 to-[#FFFFFF]/50 rounded-2xl border-2 border-[#85A947]/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
                    <h3 className="font-bold text-xl text-[#123524]">
                      Owner Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-md">
                      <p className="font-bold text-[#3E7B27] mb-1">Name</p>
                      <p className="text-[#123524] font-medium">
                        {petDetails.owner.name}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-md">
                      <p className="font-bold text-[#3E7B27] mb-1">Phone</p>
                      <p className="text-[#123524] font-medium">
                        {petDetails.owner.phone}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-md">
                      <p className="font-bold text-[#3E7B27] mb-1">Email</p>
                      <p className="text-[#123524] font-medium">
                        {petDetails.owner.email}
                      </p>
                    </div>

                    {petDetails.owner.address && (
                      <div className="p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 border border-[#85A947]/20 hover:border-[#3E7B27]/40 hover:shadow-md col-span-2">
                        <p className="font-bold text-[#3E7B27] mb-1">Address</p>
                        <p className="text-[#123524] font-medium">
                          {petDetails.owner.address}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => seteditownerinfo(!editownerinfo)}
                      className="bg-gradient-to-r from-[#123524] to-[#3E7B27] px-6 py-3 rounded-xl text-white font-semibold hover:from-[#3E7B27] hover:to-[#85A947] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#85A947]/30"
                    >
                      Edit Owner Details
                    </button>
                  </div>
                </div>
              )}
              {editownerinfo ? <EditOwnerInfo owner={petDetails?.owner} /> : ""}
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-[#85A947]/20">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFFFFF] to-[#85A947]/30 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-[#85A947] rounded-full opacity-60"></div>
                </div>
                <p className="text-[#3E7B27] text-xl font-semibold">
                  Select a pet to view details
                </p>
                <p className="text-[#123524]/60 text-sm">
                  Choose any pet from the list to see their complete information
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DogHistory;
