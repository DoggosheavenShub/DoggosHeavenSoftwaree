import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { editOwnerDetails } from "../../store/slices/petSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
const EditOwnerInfo = ({ owner }) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      segment: "",
      address: "",
    },
  });
    const [isLoading, setIsLoading] = useState(false);
    const navigate=useNavigate();
    const dispatch = useDispatch();
    
  useEffect(() => {
    if (owner) {
      reset({
        name: owner.name || "",
        phone: owner.phone || "",
        email: owner.email || "",
        segment: owner.segment || "",
        address: owner.address || "",
      });
    }
  }, [owner, reset]);

  const onSubmit = (data) => {
  
    data.id = owner?._id;

    setIsLoading(true);
    dispatch(editOwnerDetails(data))
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
    <div className="w-[95%] mt-8 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="ownerName"
              className="block text-sm font-medium text-gray-700"
            >
              Owner Name
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
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone", {
                required: true,
                pattern: /^[0-9]{10}$/,
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="segment"
              className="block text-sm font-medium text-gray-700"
            >
              Segment
            </label>
            <select
              id="segment"
              {...register("segment", { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="Day Care">Day Care</option>
              <option value="Veterinary">Veterinary</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <textarea
            id="address"
            {...register("address", { required: true })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
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

export default EditOwnerInfo;
