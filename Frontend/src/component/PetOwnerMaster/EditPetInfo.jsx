import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { editPetDetails } from "../../store/slices/petSlice";
import { useNavigate } from "react-router-dom";
const EditPetInfo = ({ pet }) => {
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
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate();
  const dispatch = useDispatch();
  
  // Function to format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ""; // Handle invalid dates
      return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "";
    }
  };

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: pet?.name || "",
      species: "dog",
      breed: pet?.breed || "",
      customBreed: "",
      sex: pet?.sex || "",
      color: pet?.color || "",
      dob: formatDate(pet?.dob) || "",
      neutered: pet?.neutered || false,
      registrationDate: formatDate(pet?.registrationDate) || "",
      vaccinations: pet?.vaccinations || [],
    },
  });

  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const selectedBreed = watch("breed");

  // Reset form values when pet prop changes
  useEffect(() => {

    if (pet) {
      reset({
        name: pet.name || "",
        species: "dog",
        breed: pet.breed || "",
        customBreed: "",
        sex: pet.sex || "",
        color: pet.color || "",
        dob: formatDate(pet.dob) || "",
        neutered: pet.neutered || false,
        registrationDate: formatDate(pet.registrationDate) || "",
        vaccinations: pet.vaccinations || [],
      });
      setIsCustomBreed(pet.breed && !speciesBreeds.dog.includes(pet.breed));
    }
  }, [pet, reset]);

  useEffect(() => {
    if (selectedBreed === "Other") {
      setIsCustomBreed(true);
    } else {
      setIsCustomBreed(false);
      setValue("customBreed", "");
    }
  }, [selectedBreed, setValue]);

  const handleAddVaccination = () => {
    const currentVaccinations = watch("vaccinations") || [];
    setValue("vaccinations", [
      ...currentVaccinations,
      { name: "", numberOfDose: "" },
    ]);
  };

  const handleRemoveVaccination = (index) => {
    const currentVaccinations = watch("vaccinations") || [];
    setValue(
      "vaccinations",
      currentVaccinations.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data) => {
    
    data.id = pet?._id

    setIsLoading(true);
    dispatch(editPetDetails(data))
      .then((data) => {
        if (data?.payload?.success) {
          alert("Changes saved successfully");
          navigate("/dashboard");
        } else alert(data?.payload?.message);
      })
      .catch(() => {
        alert("Error saving data");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="breed"
              className="block text-sm font-medium text-gray-700"
            >
              Breed
            </label>
            <select
              id="breed"
              {...register("breed", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select a breed</option>
              {speciesBreeds.dog.map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {isCustomBreed && (
              <input
                type="text"
                id="customBreed"
                {...register("customBreed", { required: isCustomBreed })}
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter custom breed"
              />
            )}
          </div>
          <div>
            <label
              htmlFor="sex"
              className="block text-sm font-medium text-gray-700"
            >
              Sex
            </label>
            <select
              id="sex"
              {...register("sex", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700"
            >
              Color
            </label>
            <input
              type="text"
              id="color"
              {...register("color", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              {...register("dob", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="flex items-center">
            <label
              htmlFor="neutered"
              className="block text-sm font-medium text-gray-700"
            >
              Neutered
            </label>
            <input
              type="checkbox"
              id="neutered"
              {...register("neutered")}
              className="mt-1 ml-4 block w-4 h-4 rounded-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="registrationDate"
              className="block text-sm font-medium text-gray-700"
            >
              Registration Date
            </label>
            <input
              type="date"
              id="registrationDate"
              {...register("registrationDate", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
          {watch("vaccinations")?.map((vaccination, index) => (
            <div key={index} className="flex items-center gap-4 mb-2">
              <input
                type="text"
                {...register(`vaccinations[${index}].name`)}
                className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Vaccination Name"
              />
              <input
                type="number"
                {...register(`vaccinations[${index}].numberOfDose`)}
                className="w-1/4 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Doses"
              />
              <button
                type="button"
                onClick={() => handleRemoveVaccination(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleAddVaccination}
              className="py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Vaccination
            </button>
          </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            disabled={isLoading}
            type="submit"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPetInfo;
