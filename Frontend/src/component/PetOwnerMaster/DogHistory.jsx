import { useState, useEffect } from "react";

import VaccinationPopup from "./VaccinationPopup";

import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  filterPetsByNameAndPhone,
  getPetDetails,
} from "../../store/slices/petSlice";
import "../../App.css";

const DogHistory = () => {
  const { petList, getPetListLoading, petDetails, petDetailsLoading } =
    useSelector((state) => state.pets);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
  }, [name, phone]);

  const navigateToVisit = (_id) => {
    navigate(`/nvisit2`, { state: { _id } });
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

  return (
    <div className="container w-screen mx-auto p-4 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex justify-between items-center mb-8">
        <Link to="/BreedManagement">
          {" "}
          <h2 className="text-blue-950"> ◉ Filter pets by breed</h2>
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 ml-[27rem]">
          Pet Records
        </h1>

        <Link to="/pet">
          <button className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  bg-blue-950 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add Pet
          </button>
        </Link>
      </div>

      <div className="grid mt-5 grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dog List */}
        <div className="md:col-span-1">
          <div className="w-full flex justify-between">
            <input
              type="text"
              value={name}
              placeholder="Pet name"
              onChange={(e) => setName(e.target.value)}
              className="w-[49%] p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
            <input
              type="text"
              placeholder="Phone No."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-[49%] p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
          <div
            className="bg-white mt-5 rounded-xl h-[150vh] overflow-y-scroll hidescroller shadow-lg p-6 backdrop-blur-lg backdrop-filter"
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              All Pets
            </h2>
            <div className="space-y-3">
              {petList?.map((dog) => (
                <button
                  key={dog._id}
                  onClick={() => fetchDogDetails(dog._id)}
                  className="w-full text-left p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md"
                >
                  <p className="font-medium text-gray-800">{dog.name}</p>
                  <p className="text-sm text-gray-600">
                    {dog.breed || dog.species}
                    {dog.owner && ` - Owner: ${dog.owner.name}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dog Details */}
        <div className="md:col-span-2">
          {petDetails ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                {petDetails.name}
              </h2>

              {/* Pet Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* ... existing pet details code with enhanced styling ... */}
                {petDetails.species && (
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                    <p className="font-semibold text-gray-700">Species</p>
                    <p className="text-gray-600">{petDetails.species}</p>
                  </div>
                )}

                {petDetails.breed && (
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                    <p className="font-semibold text-gray-700">Breed</p>
                    <p className="text-gray-600">{petDetails.breed}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                  <p className="font-semibold text-gray-700">Sex</p>
                  <p className="text-gray-600">{petDetails.sex}</p>
                </div>

                {petDetails.color && (
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                    <p className="font-semibold text-gray-700">Color</p>
                    <p className="text-gray-600">{petDetails.color}</p>
                  </div>
                )}

                {petDetails.dob && (
                  <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                    <p className="font-semibold text-gray-700">Date of Birth</p>
                    <p className="text-gray-600">
                      {new Date(petDetails.dob).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {petDetails?.vaccinations &&
                  petDetails?.vaccinations.length > 0 && (
                    <div
                      className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                      onClick={() => setIsOpen(true)}
                    >
                      <p className="font-semibold text-gray-700">
                        Vaccinations
                      </p>
                      <p className="text-gray-500 text-sm">
                        Click to view details
                      </p>
                    </div>
                  )}

                <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                  <button
                    onClick={() => navigateToVisit(petDetails?._id)}
                    className="bg-[#172554] px-5 py-2 rounded-md text-white hover:bg-[#172554] transition-colors duration-300"
                  >
                    Add Visit
                  </button>
                </div>
                {/* Popup Component */}
                <VaccinationPopup
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  vaccinations={petDetails.vaccinations || []}
                />
              </div>

              {/* Owner Details Section with enhanced styling */}
              {petDetails.owner && (
                <div
                  className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    Owner Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                      <p className="font-semibold">Name</p>
                      <p className="text-gray-600">{petDetails.owner.name}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                      <p className="font-semibold">Phone</p>
                      <p className="text-gray-600">{petDetails.owner.phone}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-600">{petDetails.owner.email}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                      <p className="font-semibold">Segment</p>
                      <p className="text-gray-600">
                        {petDetails.owner.segment}
                      </p>
                    </div>
                    {petDetails.owner.address && (
                      <div className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
                        <p className="font-semibold">Address</p>
                        <p className="text-gray-600">
                          {petDetails.owner.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-500 text-lg">
                Select a pet to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DogHistory;
