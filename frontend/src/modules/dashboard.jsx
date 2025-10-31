import { use, useEffect, useState } from "react";
import "../css/dashboard.css";
import CreatingAccount from "../components/creatingAccount.jsx";
import UsingApp from "../components/usingApp.jsx";
import NavigatingApp from "../components/navigatingApp.jsx";
import CourseDisplay from "./courseDisplay.jsx";
import PopupGuide from "../utils/popupGuide.jsx";
import AboutPDM from "./about.jsx";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, ScrollSmoother } from "gsap/all";
import gsap from "gsap";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

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

    const offset = 150;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    const start = window.scrollY;
    const distance = offsetPosition - start;
    const duration = 500;
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
    if (loading) return;
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

    gsap.from(".course-text", {
      translateX: -1000,
      duration: 1,
      stagger: 0.5,
      scrollTrigger: {
        trigger: ".course-text",
        start: "top 100%",
        toggleActions: "play reverse play reverse",
      }
    })
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const smoother = ScrollSmoother.create(
      {
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 2,
        effects: true,
      }
    );
  }, [loading]);
  return (
    <>
      {loading && (
        <div className="absolute flex-col gap-5 w-full h-full z-50 flex items-center justify-center bg-amber-900/10 backdrop-blur-2xl">
          <span className="loader"></span>
          <span class="loaderBar"></span>
        </div>
      )}
      {!loading && (
        <div id="smooth-wrapper" className="flex flex-col bg-[rgb(51,13,3)">
          {/* Navigation Bar */}
          <div className="navigation-bar px-[1rem] py-[0.5rem] justify-between w-full h-fit flex flex-row bg-white/70 backdrop-blur-sm items-center fixed border-b-2 border-amber-400 z-10">
            <div className="flex items-center gap-1">
              <img
                src="./images/PDM-Logo.svg"
                alt="PDM Logo"
                className="w-[5%]"
              />
              <h1 className="typo-subheader-semibold">
                <span className="text-amber-300">Information</span>System
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

          <div id="smooth-content">
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
            <div className="w-full flex flex-col gap-5 bg-[rgb(51,13,3)] h-fit p-[2vw]">
              <div className="flex flex-col p-[1vw] border-l-5 overflow-hidden border-amber-400 text-white">
                <h1 className="course-text typo-header-semibold">Offereded Programs</h1>
                <h2 className="course-text typo-content-semibold">
                  Explore our most popular courses designed by industry experts
                </h2>
              </div>
              <div>
                <CourseDisplay />
              </div>
            </div>

            {/* Mission and Vission */}
            <div className="w-full flex flex-row justify-between gap-[3vw] p-[2vw]">
                <div className="w-[55%] rounded-md aspect-[1] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8),rgba(0,0,0,0.3)),url(./images/graduation.jpg)] bg-no-repeat bg-cover"></div>
                <div className="w-[45%] flex flex-col gap-[3vw]">
                  <div className="w-full rounded-md aspect-square bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8),rgba(0,0,0,0.3)),url(./images/Atrium.jpg)] bg-no-repeat bg-cover"></div>
                  <div className="w-full rounded-md aspect-square bg-amber-300"></div>
                </div>
            </div>
          </div>
          
          {/* <div
            id="courses"
            className=" flex flex-row items-center justify-center shadow-lg shadow-gray-400 bg-amber-500 w-full h-90 z-1"
          >
            <div className="w-[80%] h-[110%] shadow-lg shadow-gray-700 bg-amber-900">
              <CourseDisplay />
            </div>
          </div>

          <div id="about" className="w-full h-[100vh] bg-white">
            <AboutPDM></AboutPDM>
          </div> */}
        </div>
      )}
    </>
  );
}

export default Dashboard;
