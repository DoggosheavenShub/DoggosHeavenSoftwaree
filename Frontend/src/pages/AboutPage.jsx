import { useState } from "react"
import { ArrowDown } from "lucide-react"


function AboutUs() {

  return (
    <div className="p-8 max-w-6xl mx-auto">
   <div className="w-full flex justify-center">
  <h1 className="text-5xl font-black mb-7">About Us</h1>
</div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        
        <div>
          <h1 className="text-5xl font-black mb-6">Who We Are</h1>

          <p className="text-lg mb-6">
            At Doggos Heaven, we believe that every dog deserves a life full of joy, care, and unconditional love. We're
            more than just a destination for pets — we're a second home where every wagging tail is celebrated and every
            furry face is treated like family.
          </p>

          <p className="text-lg">
            Built by passionate animal lovers, Doggos Heaven is designed to create the perfect balance of comfort,
            safety, and happiness. Our mission is to provide an environment where dogs feel free, nurtured, and truly
            understood. From the moment your dog steps through our doors, they become part of our family — surrounded by
            kindness, expert care, and endless affection.
          </p>
        </div>

        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
          <img src="./images/g1.jpeg" alt="Dogs being cared for" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-black mb-8">Mission & Promise</h1>

          <p className="text-lg">
            At Doggos Heaven, our mission is to provide a nurturing, joyful, and safe environment where dogs can thrive
            emotionally, socially, and physically. We are committed to treating every dog with personalized attention,
            expert care, and genuine love, building a community where pets and pet parents feel trusted, supported, and
            celebrated.
          </p>
        </div>

        <div className="relative">
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <img src="./images/g2.jpeg" alt="Person with dog" className="w-full h-full object-cover" />
          </div>

         
        </div>
      </div>
    </div>

     <div className="relative">
        

        <h1 className="text-5xl font-black mb-12 text-center">Our Impact</h1>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <img src="./images/g4.jpeg" alt="Cat with food bowl" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-6">
            <p className="text-lg">
              At Doggos Heaven, every wag, every cuddle, and every happy bark tells a story of trust, love, and
              transformation. We're proud to have built a space where dogs of all breeds, ages, and personalities can
              find joy, comfort, and a sense of belonging.
            </p>

            <p className="text-lg">
              Over time, we've helped countless dogs grow more confident, healthier, and socially connected. Nervous
              pups find their courage, playful ones find their pack, and senior dogs discover a new spring in their
              step. Every day, we see stronger bonds between pets and their families — built on the foundation of expert
              care, trust, and compassion.
            </p>
          </div>
        </div>
      </div>

         {/* <div className="relative">
        <div className="absolute top-10 left-20">
          <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
        </div>

        <div className="absolute top-10 right-20">
          <div className="w-12 h-12 bg-gray-800 rounded-full border-4 border-white"></div>
        </div>

        <h1 className="text-6xl font-black text-center mb-12 max-w-4xl mx-auto leading-tight">
          We're very proud to be and we will always put our before profit.
        </h1>

        <div className="flex justify-center gap-4 mt-12">
          <img
            src="./images/g5.jpeg"
            alt="Dog with heart glasses"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <img src="./images/g6.jpeg" alt="Dog with bow" width={200} height={200} className="rounded-lg" />
          <img
            src="./images/g7.jpeg"
            alt="Dog with heart tag"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <img
            src="./images/g3.jpeg"
            alt="Dog with bow tie"
            width={200}
            height={200}
            className="rounded-lg"
          />
          <img
            src="./images/g4.jpeg"
            alt="Dog with heart headband"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
      </div> */}
    </div>
  )
}

export default AboutUs





