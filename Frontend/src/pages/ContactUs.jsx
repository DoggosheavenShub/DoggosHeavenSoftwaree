import ContactForm from "./contactForm"


function ContactUs() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="relative mb-12">
        <div className="absolute top-0 right-10">
          <div className="w-24 h-24 flex items-center justify-center">
            <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
            <div className="absolute w-12 h-2 bg-yellow-400 rotate-45 -translate-y-6 translate-x-4"></div>
            <div className="absolute w-12 h-2 bg-yellow-400 -rotate-45 -translate-y-6 -translate-x-4"></div>
          </div>
        </div>

        <h1 className="text-6xl font-black text-center mb-8">Contact us</h1>

        <p className="text-lg text-center max-w-3xl mx-auto">
          We'd love to hear from you - please use the form to send us your message or ideas. Or simply pop in for a cup
          of fresh tea and a cookie:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
        <div>
          <p className="text-lg mb-2">Plot-11, Block J, Sector 83,</p>
          <p className="text-lg mb-2">Nearby Vatika V'lante,</p>
          <p className="text-lg mb-6">Gurugram, HR, 122004</p>
        </div>

        <div>
          <p className="text-lg mb-2">Call us: +918920322503</p>
          <p className="text-lg mb-2">Email: care@doggosheaven.com</p>
        </div>
      </div>

      <ContactForm/>
    </div>
  )
}

export default ContactUs
