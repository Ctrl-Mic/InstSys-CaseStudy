import React, { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPDM() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [visibleElements, setVisibleElements] = useState(new Set());

  useGSAP(() => {
    gsap.from(".history", {
      yPercent: 130,
      duration: 0.7,
      stagger: 0,
      ease: "circ",
      scrollTrigger: {
        trigger: ".history",
        start: "top 90%",
      },
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => {
      if (el.id) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const objectives = [
    "Inculcate among students and all stakeholders a culture of excellence by communicating the school vision and mission across all sectors of the college",
    "Impart knowledge through effective instruction delivered by a core of qualified and competent faculty",
    "Offer relevant degree and non-degree programs that are responsive to the current needs",
    "Instill social awareness among all stakeholders through relevant and worthwhile community extension programs",
    "Nurture talents and skills of students through various social, cultural, and co-curricular activities",
    "Assist students through provision of support services that will address varied needs and concerns",
    "Tap and mold future leaders through active student involvement",
    "Adapt to the changes in the society through continuing professional education of the teaching and non-teaching force",
    "Contribute to the development of new knowledge through researches",
    "Strengthen skills and capabilities of students through relevant exposure and establishment of linkages",
    "Inculcate virtues of goodwill, integrity, nationalism, and pride in our heritage as a people",
  ];

  const milestones = [
    {
      date: "April 26, 2010",
      event:
        "First day of enrollment - PDM became an important landmark along MacArthur Highway as hundreds of students flocked to the campus to enroll",
    },
    {
      date: "May 9, 2010",
      event:
        "Inauguration and blessing of PDM - A historic date as the entire people of Marilao gathered seeking GOD's guidance and took a major leap as we propel forward the realization of a DREAM which bloomed into a PUBLIC SERVANTS' COMMITMENT TO THE PEOPLE OF MARILAO",
    },
    {
      date: "May 24, 2010",
      event:
        "Citizen Charter was formulated - Few days before the scheduled opening of classes, Chief Executive Guillermo, in collaboration with members of the Quality Assessment Team (QAT), crafted the written pledges of quality service delivery",
    },
    {
      date: "June 2010",
      event:
        "BS in Information Technology & BS in Hotel and Restaurant Management - The very first curriculum offerings of the college, June 15, 2010, the very first day classes, two hundred forty-nine (249) total enrollees - 50 enrollments short than that of the projected 300 enrollments, thereby earning Dr. Epifanio V. Guillermo the first Chairman of the Board of Trustees",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        [data-animate] {
          opacity: 0;
        }

        [data-animate].visible {
          animation-duration: 0.8s;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-animate="fadeInUp"].visible {
          animation-name: fadeInUp;
        }

        [data-animate="fadeInLeft"].visible {
          animation-name: fadeInLeft;
        }

        [data-animate="fadeInRight"].visible {
          animation-name: fadeInRight;
        }

        [data-animate="scaleIn"].visible {
          animation-name: scaleIn;
        }

        [data-animate="slideDown"].visible {
          animation-name: slideDown;
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }

        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.7);
        }
      `}</style>
      {/* History Section */}
      <section
        id="history"
        className="flex flex-col justify-center items-center"
      >
        <div className="p-[4vw] w-full flex flex-col gap-10 justify-center items-center">
          <div className="border-b-4 overflow-hidden border-amber-300 w-fit">
            <h1 className="history typo-header-bold text-amber-900">HISTORY</h1>
          </div>
          <div
            id="history-content"
            data-animate="fadeInUp"
            className={`bg-gray-100 rounded-xl flex flex-col gap-3 shadow-md shadow-black/30 p-6 md:p-10 h-fit overflow-y-auto custom-scrollbar ${
              visibleElements.has("history-content") ? "visible" : ""
            }`}
          >
            <p className="text-gray-700 leading-relaxed typo-content-thin">
              In 2007, a dream began to take shape through a simple conversation
              among four notable men - Mayor Epifanio V. Guillermo, Vice Mayor
              Juanito H. Santiago, Governor Joselito Mendoza, and Mr. William R.
              Villarica. These public servants and philanthropists share one
              vision - a better future for every Marileno.
            </p>
            <p className="text-gray-700 leading-relaxed typo-content-thin">
              A parcel of land, generously donated by Mr. William Villarica,
              Atty. Henry Villarica, and Mrs. Linabel N. Villarica, was
              initially planned to become the third public high school in
              Marilao; however, after learning the clamor of the people and
              recognizing the need for accessible education, the idea was turned
              into something greater on the establishment of Marilao's very own
              local college.
            </p>
            <p className="text-gray-700 leading-relaxed typo-content-thin">
              As ideas and support continued to pour in, proposals such as
              expanding the campuses of PUP or Bulacan Polytechnic College were
              considered. Yet, a decisively deferring action and commitment to
              serve Mayor Epifanio V. Guillermo made a defining decision –
              Marilao would among the very few LGU-funded to operate its OWN
              COLLEGE. Thus began the remarkable journey toward the realization
              of a dream – a lasting legacy of hope, service, and education for
              the people of Marilao.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section
        id="milestones"
        className="flex flex-col justify-center items-center"
      >
        <div className="p-[4vw] w-full flex flex-col gap-10 justify-center items-center">

          <div className="border-b-4 overflow-hidden border-amber-300 w-fit">
            <h1 className="history typo-header-bold text-amber-900">MILESTONES</h1>
          </div>

          <div className="relative flex flex-col p-[1rem] items-center gap-5 h-fit overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 bottom-0 h-full left-1/2 w-[0.3rem] bg-yellow-400"></div>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                id={`milestone-${index}`}
                data-animate={index % 2 === 0 ? "fadeInLeft" : "fadeInRight"}
                className={`w-[80%]  flex items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } ${
                  visibleElements.has(`milestone-${index}`) ? "visible" : ""
                }`}
              >
                <div className="w-full md:w-5/12"></div>
                <div className="w-full md:w-2/12 flex justify-center">
                  <div className="w-[2.5vw] aspect-square bg-amber-900 rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-yellow-400 font-bold">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-5/12 mt-4 md:mt-0">
                  <div className="bg-gray-100 rounded-lg shadow-black/30 shadow-lg p-[1.5vw] hover:shadow-xl transition-shadow">
                    <h3 className="typo-content-bold text-amber-900">
                      {milestone.date}
                    </h3>
                    <p className="text-gray-700 typo-content-light leading-relaxed">
                      {milestone.event}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[rgb(51,13,3)] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">
              Pambayang Dalubhasaan ng Marilao
            </h3>
            <p className="text-yellow-200 italic">
              "Where quality education is a right - not a privilege"
            </p>
          </div>
          <div className="border-t border-white/20 pt-6">
            <p className="text-sm text-white/80">
              Copyright © 2025 Pambayang Dalubhasaan ng Marilao. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
