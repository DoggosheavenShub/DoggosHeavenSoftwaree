import { useState } from "react";
import { useForm } from "react-hook-form";
import { addPet } from "../../store/slices/petSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PetForm = () => {
  const { addPetLoading } = useSelector((state) => state.pets);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [pets, setPets] = useState([{ vaccinations: [] }]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    dispatch(addPet(data))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Data saved successfully");
          reset();
          setPets([{}]);
          navigate("/history");
        } else alert(data?.payload?.message);
      })
      .catch((err) => {
        alert("Error saving data");
      });
  };

  const speciesBreeds = {
    dog: [
      "Labrador Retriever",
      "German Shepherd",
      "Golden Retriever",
      "Shih Tzu",
      "Siberian Husky",
      "Poodle (Toy, Miniature, Standard)",
      "Maltipoo",
      "Pug",
      "Beagle",
      "Rottweiler",
      "Doberman Pinscher",
      "Boxer",
      "Great Dane",
      "Saint Bernard",
      "Cocker Spaniel",
      "Lhasa Apso",
      "Dachshund",
      "Chihuahua (Teacup & Standard)",
      "Pitbull Terrier",
      "Akita Inu",
      "Dalmatian",
      "French Bulldog",
      "English Bulldog",
      "Border Collie",
      "Bullmastiff",
      "Alaskan Malamute",
      "Cane Corso",
      "Belgian Malinois",
      "Pomeranian (including Toy Pomeranian)",
      "Yorkshire Terrier",
      "American Eskimo Dog",
      "Boston Terrier",
      "Afghan Hound",
      "Cavalier King Charles Spaniel",
      "Maltese",
      "Samoyed",
      "Newfoundland",
      "West Highland White Terrier (Westie)",
      "Miniature Schnauzer",
      "Bernese Mountain Dog",
      "Irish Setter",
      "Basset Hound",
      "Scottish Terrier",
      "Havanese",
      "Weimaraner",
      "Jack Russell Terrier",
      "Bloodhound",
      "Whippet",
      "Shetland Sheepdog",
      "Shiba Inu",
      "Indian Spitz",
      "Rajapalayan",
      "Gaddi Kutta",
      "Indie",
    ],
  };

  const handleAddPet = () => {
    setPets([...pets, { vaccinations: [] }]);
  };

  const handleAddVaccination = (petIndex) => {
    const newPets = [...pets];
    newPets[petIndex].vaccinations = [
      ...(newPets[petIndex].vaccinations || []),
      { name: "", numberOfDose: "" },
    ];
    setPets(newPets);
  };

  const handleRemoveVaccination = (petIndex, vaccinationIndex) => {
    const newPets = [...pets];
    newPets[petIndex].vaccinations.splice(vaccinationIndex, 1);
    setPets(newPets);
  };

  if (addPetLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#85A947]/30 border-t-[#3E7B27] mx-auto mb-4"></div>
          <p className="text-[#3E7B27] font-semibold text-lg">
            Adding pet information...
          </p>
        </div>
      </div>
    );
  } else
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFE3C2] to-[#85A947]/10 py-8">
        <div className="max-w-4xl mx-auto p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#85A947]/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-5 h-5 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
            <h1 className="text-3xl font-bold text-[#123524]">
              Add New Pet & Owner
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Owner Information Section */}
            <div className="bg-gradient-to-br from-[#85A947]/10 to-[#EFE3C2]/50 rounded-2xl p-8 border border-[#85A947]/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
                <h3 className="text-2xl font-bold text-[#123524]">
                  Owner Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="ownerName"
                    className="block text-sm font-bold text-[#3E7B27] mb-2"
                  >
                    Owner Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="ownerName"
                      {...register("ownerName", { required: true })}
                      className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                      placeholder="Enter owner's full name"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-bold text-[#3E7B27] mb-2"
                  >
                    Phone Number
                  </label>
                  
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      maxLength={10}
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter a valid 10-digit phone number",
                        },
                      })}
                      className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                      placeholder="Phone number"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                  </div>

                  {/* ✅ Inline error display */}
                  {errors.phone && (
                    <p className="text-red-600 text-sm font-medium mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-[#3E7B27] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                      placeholder="Enter email address"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-bold text-[#3E7B27] mb-2"
                >
                  Address
                </label>
                <div className="relative">
                  <textarea
                    id="address"
                    {...register("address", { required: true })}
                    rows={4}
                    className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200 resize-none"
                    placeholder="Enter complete address including city, state, and postal code"
                  />
                  <div className="absolute right-3 top-4 w-2 h-2 bg-[#85A947] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Pet Information Section */}
            <div className="bg-white/90 rounded-2xl p-8 border border-[#85A947]/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-4 h-4 bg-gradient-to-r from-[#3E7B27] to-[#85A947] rounded-full"></div>
                <h2 className="text-2xl font-bold text-[#123524]">
                  Pet Information
                </h2>
              </div>

              {pets?.map((pet, petIndex) => (
                <div
                  key={petIndex}
                  className="mb-10 p-6 bg-[#EFE3C2]/20 rounded-xl border border-[#85A947]/20"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 bg-[#85A947] rounded-full"></div>
                    <h4 className="text-lg font-bold text-[#123524]">
                      Pet #{petIndex + 1}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor={`name_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Pet Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id={`name_${petIndex}`}
                          {...register(`pets[${petIndex}].name`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                          placeholder="Enter pet's name"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`species_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Species
                      </label>
                      <div className="relative">
                        <select
                          id={`species_${petIndex}`}
                          {...register(`pets[${petIndex}].species`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="dog">Dog</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#3E7B27]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`breed_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Breed
                      </label>
                      <div className="relative">
                        <select
                          id={`breed_${petIndex}`}
                          {...register(`pets[${petIndex}].breed`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="">Select a breed</option>
                          {Object.keys(speciesBreeds)?.map((species) => (
                            <optgroup
                              label={
                                species.charAt(0).toUpperCase() +
                                species.slice(1)
                              }
                              key={species}
                            >
                              {speciesBreeds[species].map((breed) => (
                                <option key={breed} value={breed}>
                                  {breed}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#3E7B27]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`sex_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Sex
                      </label>
                      <div className="relative">
                        <select
                          id={`sex_${petIndex}`}
                          {...register(`pets[${petIndex}].sex`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#3E7B27]"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`color_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Color
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id={`color_${petIndex}`}
                          {...register(`pets[${petIndex}].color`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                          placeholder="Enter pet's color"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`dob_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Date of Birth
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id={`dob_${petIndex}`}
                          max={new Date().toISOString().split("T")[0]}
                          {...register(`pets[${petIndex}].dob`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium transition-all duration-200"
                        />

                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-[#3E7B27] mb-2">
                        Neutered
                      </label>
                      <div className="flex items-center gap-3 p-4 border-2 border-[#85A947]/30 rounded-xl bg-white/90 backdrop-blur-sm">
                        <input
                          type="checkbox"
                          id={`neutered_${petIndex}`}
                          {...register(`pets[${petIndex}].neutered`)}
                          className="w-5 h-5 text-[#3E7B27] border-2 border-[#85A947]/50 rounded focus:ring-[#85A947]/20 focus:ring-4 transition-all duration-200"
                        />
                        <label
                          htmlFor={`neutered_${petIndex}`}
                          className="text-[#123524] font-medium cursor-pointer"
                        >
                          Pet has been neutered/spayed
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`registrationDate_${petIndex}`}
                        className="block text-sm font-bold text-[#3E7B27] mb-2"
                      >
                        Registration Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id={`registrationDate_${petIndex}`}
                          {...register(`pets[${petIndex}].registrationDate`, {
                            required: true,
                          })}
                          className="w-full px-4 py-4 border-2 border-[#85A947]/30 rounded-xl shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 backdrop-blur-sm text-[#123524] font-medium transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#85A947] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Vaccinations Section */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#85A947] rounded-full"></div>
                      <label className="block text-lg font-bold text-[#123524]">
                        Vaccinations
                      </label>
                    </div>

                    <div className="space-y-4">
                      {pet.vaccinations &&
                        pet.vaccinations.map(
                          (vaccination, vaccinationIndex) => (
                            <div
                              key={vaccinationIndex}
                              className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-[#85A947]/20"
                            >
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  {...register(
                                    `pets[${petIndex}].vaccinations[${vaccinationIndex}].name`
                                  )}
                                  className="w-full px-4 py-3 border-2 border-[#85A947]/30 rounded-lg shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                                  placeholder="Vaccination Name"
                                />
                              </div>
                              <div className="relative w-32">
                                <input
                                  type="number"
                                  {...register(
                                    `pets[${petIndex}].vaccinations[${vaccinationIndex}].numberOfDose`
                                  )}
                                  className="w-full px-4 py-3 border-2 border-[#85A947]/30 rounded-lg shadow-sm focus:border-[#3E7B27] focus:ring-4 focus:ring-[#85A947]/20 bg-white/90 text-[#123524] font-medium placeholder-[#123524]/50 transition-all duration-200"
                                  placeholder="Doses"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveVaccination(
                                    petIndex,
                                    vaccinationIndex
                                  )
                                }
                                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )}
                    </div>

                    <div className="flex justify-center mt-4">
                      <button
                        type="button"
                        onClick={() => handleAddVaccination(petIndex)}
                        className="px-6 py-3 border-2 border-[#85A947] rounded-xl shadow-sm text-sm font-bold text-[#3E7B27] bg-[#EFE3C2]/50 hover:bg-[#85A947] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#85A947]/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-current rounded-full"></div>
                          </div>
                          Add Vaccination
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleAddPet}
                  className="px-8 py-4 border-2 border-[#3E7B27] rounded-xl shadow-lg text-base font-bold text-[#3E7B27] bg-[#EFE3C2]/50 hover:bg-[#3E7B27] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#85A947]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-current rounded-full"></div>
                    </div>
                    Add Another Pet
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8 border-t border-[#85A947]/20">
              <button
                type="submit"
                className="px-12 py-4 border-2 border-[#3E7B27] rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-[#123524] to-[#3E7B27] hover:from-[#3E7B27] hover:to-[#85A947] focus:outline-none focus:ring-4 focus:ring-[#85A947]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  Submit Pet Registration
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default PetForm;
