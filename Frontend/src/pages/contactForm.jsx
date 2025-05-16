

import { useState } from "react"

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
    alert("Form submitted successfully!")
    setFormData({ name: "", email: "", phone: "", comment: "" })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-black mb-6">
            Have a question or comment? Use the form below to send us a message.
          </h1>

          <div className="mt-12 relative">
            <div className="absolute right-0 bottom-0">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10,10 Q60,5 110,70" stroke="black" strokeWidth="6" fill="none" />
                <path d="M90,60 L110,70 L100,40" stroke="black" strokeWidth="6" fill="none" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full p-4 text-lg rounded-full border-2 border-gray-300"
                required
              />
            </div>

            <div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full p-4 text-lg rounded-full border-2 border-gray-300"
                required
              />
            </div>

            <div>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone"
                className="w-full p-4 text-lg rounded-full border-2 border-gray-300"
              />
            </div>

            <div>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Your Comment"
                className="w-full p-4 text-lg rounded-3xl border-2 border-gray-300 min-h-[140px]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-6 text-lg font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-full"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactForm