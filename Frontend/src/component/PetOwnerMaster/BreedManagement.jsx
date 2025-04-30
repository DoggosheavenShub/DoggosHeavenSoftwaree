import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getfilterPetsByBreed } from "../../store/slices/petSlice";
import {logout} from "../../store/slices/authSlice"
const BreedManagement = () => {
  const [pets, setPets] = useState([]);
  const {filterPetsByBreedLoading}=useSelector((state)=>state.pets)

  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const [isBreedOpen, setIsBreedOpen] = useState(false);

  const dispatch=useDispatch();
 

  const speciesBreeds = {
    dog: [
      "Labrador Retriever",
      "German Shepherd",
      "Golden Retriever",
      "Bulldog",
      "Beagle",
      "Poodle",
    ],
    cat: [
      "Persian",
      "Maine Coon",
      "Siamese",
      "Ragdoll",
      "Sphynx",
      "British Shorthair",
    ],
    bird: ["Parrot", "Canary", "Cockatiel", "Finch", "Budgerigar"],
    fish: ["Betta Fish", "Goldfish", "Guppy", "Angelfish", "Cichlid"],
    rabbit: ["Himalayan", "Holland Lop", "Mini Rex", "Netherland Dwarf"],
    reptile: [
      "Bearded Dragon",
      "Leopard Gecko",
      "Corn Snake",
      "Chameleon",
      "Turtle",
    ],
    hamster: ["Syrian Hamster", "Dwarf Hamster", "Roborovski Hamster"],
    other: ["Other"],
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async (breed = "") => {
    setLoading(true);
    setError(null);

    // Build query parameters
    const params = new URLSearchParams();
    if (breed) params.append("breed", breed);
    if (selectedSpecies) params.append("species", selectedSpecies);
    const queryString = params.toString();

    dispatch(getfilterPetsByBreed(queryString)).then((data)=>{
      if(data?.payload?.success)
      setPets(data?.payload?.pets||[]);
    });

  };

  const handleSpeciesChange = (value) => {
    setSelectedSpecies(value);
    setSelectedBreed("");
    setIsSpeciesOpen(false);
    fetchPets("");
  };

  const handleBreedChange = (value) => {
    setSelectedBreed(value);
    setIsBreedOpen(false);
    fetchPets(value);
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age} years`;
  };

  // Click handler for closing dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setIsSpeciesOpen(false);
        setIsBreedOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Pet Breed Management</h2>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex gap-4">
          {/* Species Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSpeciesOpen(!isSpeciesOpen);
                setIsBreedOpen(false);
              }}
              className="w-48 px-4 py-2 text-left bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedSpecies
                ? selectedSpecies.charAt(0).toUpperCase() +
                  selectedSpecies.slice(1)
                : "Select Species"}
            </button>

            {isSpeciesOpen && (
              <div className="absolute z-10 w-48 mt-1 bg-white border rounded-md shadow-lg">
                {Object.keys(speciesBreeds).map((species) => (
                  <button
                    key={species}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeciesChange(species);
                    }}
                  >
                    {species.charAt(0).toUpperCase() + species.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Breed Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsBreedOpen(!isBreedOpen);
                setIsSpeciesOpen(false);
              }}
              disabled={!selectedSpecies}
              className={`w-48 px-4 py-2 text-left bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !selectedSpecies ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {selectedBreed || "Select Breed"}
            </button>

            {isBreedOpen && selectedSpecies && (
              <div className="absolute z-10 w-48 mt-1 bg-white border rounded-md shadow-lg">
                {speciesBreeds[selectedSpecies].map((breed) => (
                  <button
                    key={breed}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBreedChange(breed);
                    }}
                  >
                    {breed}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filterPetsByBreedLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="p-4 bg-white border rounded-lg shadow"
              >
                <h3 className="font-bold text-lg">{pet.name}</h3>
                <p className="text-sm text-gray-600">Species: {pet.species}</p>
                <p className="text-sm text-gray-600">Breed: {pet.breed}</p>
                <p className="text-sm text-gray-600">Sex: {pet.sex}</p>
                <p className="text-sm text-gray-600">
                  Age: {pet.dob ? calculateAge(pet.dob) : "Unknown"}
                </p>
                {pet.owner && (
                  <p className="text-sm text-gray-600">
                    Owner: {pet.owner.name}
                  </p>
                )}
              </div>
            ))}
            {pets.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">
                No pets found with the selected criteria
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedManagement;
