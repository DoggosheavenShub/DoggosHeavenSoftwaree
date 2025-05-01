import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slides in the public/images folder
  const slides = [
    { id: 1, placeholder: "1.jpeg", alt: "Pet care 1" },
    { id: 2, placeholder: "2.jpeg", alt: "Pet care 2" },
    { id: 3, placeholder: "3.png", alt: "Pet care 3" },
    { id: 4, placeholder: "4.png", alt: "Pet care 4" },
    { id: 5, placeholder: "5.jpeg", alt: "Pet care 5" },
    { id: 6, placeholder: "6.jpg", alt: "Pet care 6" }
  ];

  // Next Slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Previous Slide
  const prevSlide = () => {
   
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Navigate to Add New Pet Page
  const addNewPet = () => {
    navigate('/pet');
  };

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      {/* Carousel Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 w-full h-full"
        >
          <div className=" inset-0 bg-black/30 z-10" />
          <img
            src={`/images/${slides[currentSlide].placeholder}`}
            alt={slides[currentSlide].alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-300"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-50 bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors duration-300"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Add New Pet Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-9">
  <h1 className="text-5xl text-white font-bold text-center">
    Register Your Pet Here !
  </h1>
  <motion.button
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-blue-800 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out text-lg font-semibold backdrop-blur-sm"
    onClick={addNewPet}
  >
    Add New Pet
  </motion.button>
  <p className='text-xl text-white text-center max-w-[50%] '>Compassionate Care for Your Furry Friends: Expert Veterinary Services You Can Count On!</p>
</div>

    </div>
  );
};

export default Home;
