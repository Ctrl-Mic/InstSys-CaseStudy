import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function NavigatingApp() {
  const [activeSlide, setActiveSlide] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Logging In",
      content:
        "Accessing the site, you will be greeted by the Login Page where you can login usig your account, create your own account, or use the AI without needing an account by signing in as a Guest",
      image: "/guideThree/image1.png",
    },
    {
      title: "Register Account",
      content:
        "Here youi can create your own account using your student credential to access school related information to help you of your need regarding informations.",
      image: "/guideOne/image1.png",
    },
    {
      title: "Welcome to Dashboard",
      content:
        "Once entering, you'll be redirected here on Dashboard where you can see public informations about PDM such as Program Offerings, History, Vision and Mission. You can also see here a user guide that will show you on how to use the app from creating account to using the system itself.",
      image: "/guideThree/image2.png",
    },
    {
      title: "Intelligent System",
      content:
        "Like many other Intelligent System, the PDM system has the ability to answer all your question regarding PDM's public informations like events and announcements, even public details for facilities and students. You can access it by pressing the button 'Try Using Ai'. After navigating to the chat box, you can start asking questions using the message box below.",
      video: "/guideTwo/video3.mp4",
    },
  ];

  useEffect(() => {
    if (!slides[activeSlide].video) {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeSlide]);

  return (
    <div className="flex gap-10 w-full h-full p-20 relative">
      {/* Left content */}
      <div className="flex flex-col justify-between w-[60%] h-fit border-amber-800 border-l-5 pl-[1rem] gap-5">
        <div className="w-full h-fit flex flex-col">
          <h1 className="text-[clamp(2rem,3vw,5rem)] text-amber-900 font-medium transition-opacity duration-700">
            {slides[activeSlide].title}
          </h1>
          <h2 className="text-[clamp(0.8rem,1.3vw,1.4rem)] text-justify font-medium whitespace-pre-line transition-opacity duration-700 ">
            {slides[activeSlide].content}
          </h2>
        </div>

        <div className="flex flex-col gap-4 mb-5">
          <button
            onClick={() => {
              navigate("/chat");
            }}
            className="px-[5rem] py-[0.8rem] w-fit shadow-black/70 bg-amber-400 text-amber-900 font-bold rounded-md text-[clamp(0.8rem,1.3vw,1.4rem)] shadow-md hover:scale-105 transform duration-300 cursor-pointer"
          >
            Try Using AI
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
      <div className="w-[40%] aspect-auto relative rounded-sm overflow-hidden z-1 ">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-fit transition-opacity  shadow-black shadow-md duration-700 ${
              index === activeSlide ? "opacity-100 z-1" : "opacity-0 z-0"
            }`}
          >
            {slide.image && (
              <img
                src={slide.image}
                className="w-full h-full object-contain"
                alt=""
              />
            )}
            {slide.video && (
              <video
                className="w-full h-full object-contain"
                src={slides[activeSlide].video}
                autoPlay
                muted
                onEnded={() =>
                  setActiveSlide((prev) => (prev + 1) % slides.length)
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
