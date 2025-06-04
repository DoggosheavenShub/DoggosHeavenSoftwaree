// components/ServicesPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchServices } from '../../store/slices/customerServiceSlice';

const ServicesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { services, loading, error } = useSelector((state) => state.services);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const serviceCategories = [
    { id: 'grooming', name: 'Pet Grooming', price: 500 },
    { id: 'hostel', name: 'Pet Hostel', price: 800 },
    { id: 'veterinary', name: 'Veterinary Care', price: 1000 },
    { id: 'dayschool', name: 'Day School', price: 600 },
    { id: 'playschool', name: 'Play School', price: 400 },
    { id: 'daycare', name: 'Day Care', price: 700 }
  ];

  const handleBookService = (service) => {
    navigate('/bookappointment', { state: { service } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Pet Services</h1>
          <p className="text-xl text-gray-600">Choose from our professional pet care services</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCategories.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h3>
                <div className="text-3xl font-bold text-green-600 mb-6">₹{service.price}</div>
                <button
                  onClick={() => handleBookService(service)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View Appointments Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/appointments')}
            className="bg-gray-200 text-gray-800 py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View My Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;