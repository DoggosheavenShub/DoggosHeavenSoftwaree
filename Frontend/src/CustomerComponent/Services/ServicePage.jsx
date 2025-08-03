import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const ServicePage = () => {
  const location = useLocation();
  const state = location.state;

  // Example: destructure values
  const { service } = state || {};
  const {user}=useSelector((state)=>state.auth)
  const [isLoading, setIsLoading] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const navigate=useNavigate()
  const dispatch=useDispatch()
  
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm({
      defaultValues: {
        planId: "",
        petId: ""
      },
    });

  const fetchUserPets = async () => {
    try {
      if (!user?.email) {
        console.error('User email not found');
        return;
      }

      const encodedEmail = encodeURIComponent(user.email);
      const token = localStorage?.getItem("authtoken") || "";

      console.log('Fetching pets for email:', user.email);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/customerappointment/getcustomerpets?email=${encodedEmail}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User Pets API Response:', data);

      if (data.success) {
        setUserPets(data.pets || []);
        console.log('Pets set:', data.pets);
      } else {
        console.error('API returned error:', data.message);
        setUserPets([]);
      }
    } catch (error) {
      console.error('Error fetching user pets:', error);
      setUserPets([]);
      alert('Error loading pets. Please check console for details.');
    }
  };
  
    useEffect(() => {
      const initializeComponent = async () => {
        // Check if user is logged in
        if (!user?.id) {
          alert("Please login to continue");
          navigate("/login");
          return;
        }
  
        setIsLoading(true);
  
        try {
          // Fetch user's pets
          await fetchUserPets();
          
        } catch (error) {
          console.error('Error initializing component:', error);
          alert('Error loading data. Please refresh the page.');
        } finally {
          setIsLoading(false);
        }
      };
  
      initializeComponent();
    }, [dispatch, user, navigate]);

  return (
    <div className="flex items-center justify-center p-4">
      <form
        // onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >

        {/* Pet Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Pet *
          </label>
          <select
            {...register("petId", {
              required: "Please select a pet",
            })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Pet
            </option>
            {userPets && userPets.length > 0 ? (
              userPets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} - {pet.breed}
                </option>
              ))
            ) : (
              <option disabled>No pets found</option>
            )}
          </select>
          {errors.petId && (
            <p className="text-red-500 text-sm mt-1">{errors.petId.message}</p>
          )}
        </div>
      </form>
    </div>
  );
  return (
    <div>ServicePage</div>
  )
}

export default ServicePage