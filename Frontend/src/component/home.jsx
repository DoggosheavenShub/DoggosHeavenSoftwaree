import React from 'react';
import HeroSection from "../HomepageComponent/HeroSection"
import PromiseSection from "../HomepageComponent/PromiseSection"
import WhyRelySection from "../HomepageComponent/Whyrely"
import ServicesSection from "../HomepageComponent/Services"
import BookingSection from "../HomepageComponent/BookingSection"
import FAQSection from "../HomepageComponent/FaqSection"
import Footer from "../HomepageComponent/Footer"
import InstagramReelsGrid from "../HomepageComponent/instareel";



const home = () => {
  return (
    <div>
       <HeroSection />
        <PromiseSection />
        <WhyRelySection />
        <ServicesSection />
        <InstagramReelsGrid/>
        <BookingSection />
        <FAQSection />
        <Footer />
    </div>
  )
}

export default home


