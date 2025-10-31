import { use, useEffect, useState } from "react";
import "../css/dashboard.css";
import CreatingAccount from "../components/creatingAccount.jsx";
import UsingApp from "../components/usingApp.jsx";
import NavigatingApp from "../components/navigatingApp.jsx";
import CourseDisplay from "./courseDisplay.jsx";
import PopupGuide from "../utils/popupGuide.jsx";
import AboutPDM from "./about.jsx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";


function Dashboard({ goChat, goAccounts, goLogin }) {
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(1);
  const [activeView, setActiveView] = useState(1);
  const [scrollPage, setScrollPage] = useState("home");
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/health");
        if (res.ok) {
          setLoading(false); // backend is ready → hide loading
        } else {
          setTimeout(checkServer, 200); // retry after 1s
        }
      } catch {
        setTimeout(checkServer, 200); // retry after 1s
      }
    };

    checkServer();
  }, []);

  useEffect(() => {
    if (!scrollPage) return;

    const target = document.getElementById(scrollPage);
    if (!target) return;

    const offset = 80;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    const start = window.scrollY;
    const distance = offsetPosition - start;
    const duration = 300;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      window.scrollTo(0, start + distance * progress);

      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
    setScrollPage("");
  }, [scrollPage]);

  const buttons = [
    {
      id: 0,
      title: "Creating Account",
      subtitle: "Register and Login Your Account",
      defaultImg: "/dashboardBtn/btn1Act.svg",
      activeImg: "/dashboardBtn/btn1Una.svg",
    },
    {
      id: 1,
      title: "Using the System",
      subtitle: "Utilizig Smart System for your needs",
      defaultImg: "/dashboardBtn/btn2Act.svg",
      activeImg: "/dashboardBtn/btn2Una.svg",
    },
    {
      id: 2,
      title: "Navigating the App",
      subtitle: "Going through each features",
      defaultImg: "/dashboardBtn/btn3Act.svg",
      activeImg: "/dashboardBtn/btn3Una.svg",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("studentId"); // clear saved session
    goLogin(); // go back to Login page
  };

  useGSAP(() => {
    gsap.from(".navigation-bar", {
      y: -50,
      duration: 0.7,
      ease: "circ",
    });

    gsap.from(".hero-text", {
      yPercent: 130,
      duration: 1,
      stagger: 0,
      ease: "circ",
    });
  }, []);
  return (
    <>
      {loading && (
        <div className="absolute flex-col gap-5 w-full h-full z-50 flex items-center justify-center bg-amber-900/10 backdrop-blur-2xl">
          <span className="loader"></span>
          <span class="loaderBar"></span>
        </div>
      )}
      {!loading && (
        <div className="flex flex-col">
          {/* Navigation Bar */}
          <div className="navigation-bar px-[1rem] py-[0.5rem] justify-between w-full h-fit flex flex-row bg-white items-center fixed border-b-2 border-amber-400 z-10">
            <div className="flex items-center gap-1">
              <img
                src="./images/PDM-Logo.svg"
                alt="PDM Logo"
                className="w-[5%]"
              />
              <h1 className="typo-subheader-semibold">
                <span className="text-amber-500">Information</span>System
              </h1>
            </div>
            <div className="flex items-center gap-5 typo-buttons-regular">
              <a
                href="#Guide"
                onClick={(e) => {
                  e.preventDefault();
                  setScrollPage("guide");
                }}
              >
                {" "}
                Guide{" "}
              </a>
              <a
                href="#Courses"
                onClick={(e) => {
                  e.preventDefault();
                  setScrollPage("courses");
                }}
              >
                {" "}
                Courses{" "}
              </a>
              <a
                href="#About"
                onClick={(e) => {
                  e.preventDefault();
                  setScrollPage("about");
                }}
              >
                {" "}
                About PDM{" "}
              </a>
              <button className="bg-amber-400 py-[0.5rem] px-[1.4rem] text-white font-semibold rounded-sm shadow-amber-950/50 shadow-md cursor-pointer hover:scale-105 duration-300">
                Log In
              </button>
            </div>
          </div>

          {/* Hero Section */}
          <div
            id="home"
            className="flex w-full h-[100vh] pt-[5%] bg-[linear-gradient(to_bottom,rgba(121,44,26,0.8),rgba(51,13,3,1)),url('/images/PDM-Facade.png')] bg-cover bg-center bg-no-repeat"
          >
            <div className="flex flex-col gap-[5%] h-full items-center justify-center w-full pb-[10vw]">
              <div className="flex flex-col items-center">
                <div className="overflow-clip pb-[1%]">
                  <h1 className="hero-text text-yellow-400 text-center text-[clamp(2.5rem,6vw,9rem)] font-medium font-serif leading-[100%]">
                    Learning Made Smarter
                  </h1>
                </div>
                <div className="overflow-clip">
                  <h2 className="hero-text text-white text-[clamp(0.7rem,1.8vw,5rem)] font-medium ">
                    Pambayang Dalubhasaan ng Marilao
                  </h2>
                </div>
              </div>
              <div className="flex gap-7 w-full justify-center">
                <button
                  onClick={goChat}
                  className="text-amber-950 cursor-pointer w-[12vw] py-[0.5rem] font-bold text-[clamp(0.5rem,1.3vw,2rem)] rounded-md bg-amber-400 shadow-md shadow-black hover:scale-105 transition-all duration-300"
                >
                  Try AI
                </button>
                <button
                  onClick={() => setScrollPage("guide")}
                  className="text-white cursor-pointer w-[12vw] py-[0.5rem] font-bold text-[clamp(0.5rem,1.3vw,2rem)] rounded-md border-white border-2 shadow-md shadow-black hover:scale-105 transition-all duration-300"
                >
                  User Guide
                </button>
              </div>
            </div>
          </div>
          <div id="guide" className=" bg-white w-full h-[100vh] flex flex-col">
            <div className="flex w-full items-center justify-center h-[35vh] mt-[-6%]">
              {buttons.map((btn, index) => (
                <button
                  key={btn.id}
                  onClick={() => {
                    setActiveIndex(index);
                    setActiveView(index);
                  }}
                  className={`
                w-[23%] 
                h-fit
                p-2
                duration-300 
                transform 
                ${
                  activeIndex === index
                    ? "scale-105 z-1 bg-amber-500 text-white shadow-2xl rounded-sm"
                    : "scale-100 bg-white shadow-lg"
                } 
                hover:scale-105
                flex flex-col items-center justify-center
              `}
                >
                  <img
                    src={activeIndex === index ? btn.activeImg : btn.defaultImg}
                    alt={btn.title}
                    className="w-40 h-40 object-contain mb-2"
                    draggable={false}
                  />
                  <div className="flex flex-col font-sans">
                    <h1 className="text-[clamp(1rem,2vw,3rem)] font-bold">
                      {btn.title}
                    </h1>
                    <h2 className="text-[clamp(0.6rem,1vw,2rem)] ">
                      {btn.subtitle}
                    </h2>
                  </div>
                  {btn.content}
                </button>
              ))}
            </div>

            <div className="w-full h-[60vh] relative">
              <div
                className={`${
                  activeView === 0 ? "flex" : "hidden"
                } w-full h-full justify-center items-center`}
              >
                <CreatingAccount />
              </div>
              <div
                className={`${
                  activeView === 1 ? "flex" : "hidden"
                } w-full h-full justify-center items-center`}
              >
                <UsingApp />
              </div>
              <div
                className={`${
                  activeView === 2 ? "flex" : "hidden"
                } w-full h-full justify-center items-center`}
              >
                <NavigatingApp />
              </div>
            </div>
          </div>

          <div
            id="courses"
            className=" flex flex-row items-center justify-center shadow-lg shadow-gray-400 bg-amber-500 w-full h-90 z-1"
          >
            <div className="w-[80%] h-[110%] shadow-lg shadow-gray-700 bg-amber-900">
              <CourseDisplay />
            </div>
          </div>

          <div id="about" className="w-full h-[100vh] bg-white">
            <AboutPDM></AboutPDM>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
