import { useState, useEffect } from "react";

export default function CourseDisplay() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setCourses] = useState([]);

  // Fetch courses from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
      })
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides]);

  return (
    <div className="relative w-full aspect-[1/0.5] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute flex flex-col w-full h-full bg-cover bg-center transition-transform duration-700 ease-in-out`}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.3)), url(${slide.image})`,
            transform: `translateX(${100 * (index - activeSlide)}%)`,
          }}
        >
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`flex flex-col transition-opacity duration-700 absolute top-[2vw] left-[2vw] w-full ${
                  index === activeSlide ? "opacity-100 z-1" : "opacity-0 z-0"
                }`}
              >
                <h1 className="text-[clamp(0.8rem,2vw,2rem)] leading-tight text-amber-400 typo-header-bold overflow-hidden">
                  {slide.department}
                </h1>
                <h1 className="text-[clamp(2rem,2.7vw,3rem)] line-clamp-3 leading-tight text-white font-bold">
                  {slide.program}
                </h1>
              </div>
            ))}
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`flex flex-col w-[80%] transition-opacity duration-700 absolute bottom-[2vw] left-[2vw] ${
                  index === activeSlide ? "opacity-100 z-1" : "opacity-0 z-0"
                }`}
              >
                <h2 className="text-[clamp(0.8rem,2vw,2rem)] leading-tight font-medium typo-content-semibold whitespace-pre-line line-clamp-4 text-justify  text-white">
                {slide.description}
              </h2>
              </div>
            ))}
          </div>
      ))}
    </div>
  );
}