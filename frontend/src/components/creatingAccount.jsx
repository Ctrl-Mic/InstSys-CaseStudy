import { useState, useEffect } from "react";

export default function CreatingAccount() {
    const [activeSlide, setActiveSlide] = useState(0);
    const slides = [
    {
        title: "Register Account",
        content: "If you’re a new user in the system, you must first Create an account for you to access the app. In creating an account, click the “Create Account” in the Login form under Login button and you have to fill the fields in the form",
        image: "/guideOne/image1.png",
    },
    {
        title: "Requirements",
        content: 
        `• A valid email account (format: name.pdm@gmail.com).
        • Employee and Student Id Number (format: PDM-0000-000000).
        • Correct information about you that the school provided such as (Course and Year level).
        • A unique and secured password only you know.`,
        image: "/guideOne/image1.png",
    },
    {
        title: "Register Account",
        content: "Create a password combining (Uppercase & Lowercase letter, Numbers and Special character) for the system to accept your password e.g. Password123!.",
        image: "/guideOne/image2.png",
    },
    {
        title: "Register Account",
        content: "Select Course, there’s an option a choose the correct Course and if the selected course is incorrect the user will have a problem in regarding to requesting files or information about their personal data from the system.",
        image: "/guideOne/image3.png",
    },
    {
        title: "Register Account",
        content: "Select Year level, just like the course, if it doesn’t match to the data from the system the user will have a problem in regarding to requesting files or information about their personal data.",
        image: "/guideOne/image3.png",
    },
    {
        title: "Register Account",
        content: "Input correct Student ID number, the format should be(PDM-0000-000000) it is provided to the ID that was given to the student by their teacher. If it is missing even number or a lowercase letter, the system will not accept it and will display message regarding to the format.",
        image: "/guideOne/image4.png",
    },
    {
        title: "Register Account",
        content: "Register Account. After correctly filling the fields in the form the user can submit it for the system to save from the data so that you can login to the app and access it.",
        image: "/guideOne/image1.png",
    },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

  return (
    <div className="flex gap-5 w-full h-full p-20 relative">
      {/* Left content */}
      <div className="flex flex-col justify-between w-[60%] h-full">
        <div className="w-full h-full flex flex-col gap-10 relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex flex-col gap-5 transition-opacity duration-700 absolute top-0 left-0 w-full ${
                index === activeSlide ? "opacity-100 z-1" : "opacity-0 z-0"
              }`}
            >
              <h1 className="text-[clamp(2rem,3vw,5rem)] text-amber-900 font-medium">{slide.title}</h1>
              <h2 className="text-[clamp(0.8rem,1.3vw,1.4rem)] font-medium whitespace-pre-line">{slide.content}</h2>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <button className="px-20 py-5 w-fit shadow-gray-500 bg-amber-400 text-amber-900 font-bold rounded-md text-[clamp(0.8rem,1.3vw,1.4rem)]  shadow-lg hover:scale-105 transform duration-300 cursor-pointer">
            Register an Account
          </button>

          <div className="flex gap-4 mt-4">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 aspect-square rounded-full cursor-pointer hover:-translate-y-1 transform duration-300 ${
                  idx === activeSlide ? "bg-amber-400" : "bg-amber-800"
                }`}
                onClick={() => setActiveSlide(idx)}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right image */}
      <div className="w-[40%] h-full relative rounded-sm overflow-hidden shadow-gray-500 shadow-lg">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full bg-contain bg-no-repeat bg-center transition-opacity duration-700 ${
              index === activeSlide ? "opacity-100 z-1" : "opacity-0 z-0"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          ></div>
        ))}
      </div>
    </div>
  );
}