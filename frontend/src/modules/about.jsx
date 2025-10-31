import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from "lucide-react";

export default function AboutPDM() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [visibleElements, setVisibleElements] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => {
      if (el.id) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

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
    "Inculcate virtues of goodwill, integrity, nationalism, and pride in our heritage as a people"
  ];

  const milestones = [
    { date: "April 26, 2010", event: "First day of enrollment - PDM became an important landmark along MacArthur Highway as hundreds of students flocked to the campus to enroll" },
    { date: "May 9, 2010", event: "Inauguration and blessing of PDM - A historic date as the entire people of Marilao gathered seeking GOD's guidance and took a major leap as we propel forward the realization of a DREAM which bloomed into a PUBLIC SERVANTS' COMMITMENT TO THE PEOPLE OF MARILAO" },
    { date: "May 24, 2010", event: "Citizen Charter was formulated - Few days before the scheduled opening of classes, Chief Executive Guillermo, in collaboration with members of the Quality Assessment Team (QAT), crafted the written pledges of quality service delivery" },
    { date: "June 2010", event: "BS in Information Technology & BS in Hotel and Restaurant Management - The very first curriculum offerings of the college, June 15, 2010, the very first day classes, two hundred forty-nine (249) total enrollees - 50 enrollments short than that of the projected 300 enrollments, thereby earning Dr. Epifanio V. Guillermo the first Chairman of the Board of Trustees" }
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

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-red-900 shadow-lg' : 'bg-red-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-red-900 font-bold text-xl">PDM</span>
              </div>
              <div className="text-white">
                <h1 className="font-bold text-lg">PDM</h1>
                <p className="text-xs text-yellow-200">Pambayang Dalubhasaan ng Marilao</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              {['home', 'mission', 'objectives', 'history', 'milestones'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`text-white hover:text-yellow-300 transition-colors capitalize font-medium ${
                    activeSection === item ? 'text-yellow-300 border-b-2 border-yellow-300' : ''
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-red-900 pb-4">
              {['home', 'mission', 'objectives', 'history', 'milestones'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="block w-full text-left px-4 py-3 text-white hover:bg-red-800 capitalize"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="h-screen pt-20 px-4 bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center text-white">
            <div 
              id="hero-logo"
              data-animate="scaleIn"
              className={`mb-6 flex justify-center ${visibleElements.has('hero-logo') ? 'visible' : ''}`}
            >
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-red-900 font-bold text-3xl">PDM</span>
              </div>
            </div>
            <h1 
              id="hero-title"
              data-animate="fadeInUp"
              className={`text-4xl md:text-6xl font-bold mb-4 ${visibleElements.has('hero-title') ? 'visible' : ''}`}
            >
              About PDM
            </h1>
            <p 
              id="hero-subtitle"
              data-animate="fadeInUp"
              className={`text-lg md:text-xl text-yellow-200 max-w-3xl mx-auto mb-6 stagger-1 ${visibleElements.has('hero-subtitle') ? 'visible' : ''}`}
            >
              Pambayang Dalubhasaan ng Marilao
            </p>
            <p 
              id="hero-tagline"
              data-animate="fadeInUp"
              className={`text-base md:text-lg text-white/90 italic max-w-2xl mx-auto stagger-2 ${visibleElements.has('hero-tagline') ? 'visible' : ''}`}
            >
              "Where quality education is a right - not a privilege"
            </p>
            <button
              id="hero-button"
              data-animate="fadeInUp"
              onClick={() => scrollToSection('mission')}
              className={`mt-6 inline-flex items-center px-8 py-3 bg-yellow-400 text-red-900 font-bold rounded-full hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg stagger-3 ${visibleElements.has('hero-button') ? 'visible' : ''}`}
            >
              Learn More
              <ChevronDown className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="min-h-screen py-16 px-4 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div
              id="mission-text"
              data-animate="fadeInLeft"
              className={visibleElements.has('mission-text') ? 'visible' : ''}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-red-900 mb-6">MISSION</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Cognizant of the importance of contributing to the realization of national development goals and as their duty as Citizen to quality education, PDM commit itself to the provision of quality education and mold its students into productive and responsible citizens who are imbued with virtues, aware of their national heritage and proud of their local culture.
              </p>
            </div>
            <div 
              id="mission-image"
              data-animate="fadeInRight"
              className={`relative ${visibleElements.has('mission-image') ? 'visible' : ''}`}
            >
              <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-lg shadow-xl p-8 transform hover:scale-105 transition-transform">
                <img 
                  src="/images/PDM-Facade.png"
                  alt="PDM Campus View"
                  className="w-full h-auto rounded-lg shadow-inner object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center"><span class="text-red-900 font-bold text-2xl">Campus View</span></div>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="min-h-screen py-16 px-4 bg-gradient-to-br from-gray-50 to-red-50 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div 
              id="vision-image"
              data-animate="fadeInLeft"
              className={`order-2 md:order-1 relative ${visibleElements.has('vision-image') ? 'visible' : ''}`}
            >
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg shadow-xl p-8 transform hover:scale-105 transition-transform">
                <img 
                  src="/images/Atrium.jpg"
                  alt="PDM Building Atrium"
                  className="w-full h-auto rounded-lg shadow-inner object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center"><span class="text-red-900 font-bold text-2xl">PDM Building</span></div>';
                  }}
                />
              </div>
            </div>
            <div 
              id="vision-text"
              data-animate="fadeInRight"
              className={`order-1 md:order-2 ${visibleElements.has('vision-text') ? 'visible' : ''}`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-red-900 mb-6">VISION</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The Pambayang Dalubhasaan ng Marilao (PDM), one of the premier higher educational institutions in the region in providing quality subsidized tertiary education and industry training programs, producing competent, competitive, capable, and skillful graduates who excel in their chosen fields.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section id="objectives" className="min-h-screen py-16 px-4 bg-gradient-to-br from-red-900 to-orange-900 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div 
            id="objectives-header"
            data-animate="slideDown"
            className={`text-center mb-12 ${visibleElements.has('objectives-header') ? 'visible' : ''}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">OBJECTIVES</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {objectives.map((objective, index) => (
              <div
                key={index}
                id={`objective-${index}`}
                data-animate="fadeInUp"
                className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20 stagger-${(index % 6) + 1} ${visibleElements.has(`objective-${index}`) ? 'visible' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-900 font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{objective}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" className="min-h-screen py-16 px-4 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div 
            id="history-header"
            data-animate="slideDown"
            className={`text-center mb-12 ${visibleElements.has('history-header') ? 'visible' : ''}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">HISTORY</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          <div 
            id="history-content"
            data-animate="fadeInUp"
            className={`bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-6 md:p-10 max-h-[65vh] overflow-y-auto custom-scrollbar ${visibleElements.has('history-content') ? 'visible' : ''}`}
          >
            <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
              In 2007, a dream began to take shape through a simple conversation among four notable men - Mayor Epifanio V. Guillermo, Vice Mayor Juanito H. Santiago, Governor Joselito Mendoza, and Mr. William R. Villarica. These public servants and philanthropists share one vision - a better future for every Marileno.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
              A parcel of land, generously donated by Mr. William Villarica, Atty. Henry Villarica, and Mrs. Linabel N. Villarica, was initially planned to become the third public high school in Marilao; however, after learning the clamor of the people and recognizing the need for accessible education, the idea was turned into something greater on the establishment of Marilao's very own local college.
            </p>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              As ideas and support continued to pour in, proposals such as expanding the campuses of PUP or Bulacan Polytechnic College were considered. Yet, a decisively deferring action and commitment to serve Mayor Epifanio V. Guillermo made a defining decision – Marilao would among the very few LGU-funded to operate its OWN COLLEGE. Thus began the remarkable journey toward the realization of a dream – a lasting legacy of hope, service, and education for the people of Marilao.
            </p>
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section id="milestones" className="min-h-screen py-16 px-4 bg-gradient-to-br from-gray-50 to-orange-50 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div 
            id="milestones-header"
            data-animate="slideDown"
            className={`text-center mb-12 ${visibleElements.has('milestones-header') ? 'visible' : ''}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-red-900 mb-4">MILESTONES</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          <div className="relative max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-yellow-400 hidden md:block"></div>
            {milestones.map((milestone, index) => (
              <div 
                key={index} 
                id={`milestone-${index}`}
                data-animate={index % 2 === 0 ? 'fadeInLeft' : 'fadeInRight'}
                className={`mb-12 flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} ${visibleElements.has(`milestone-${index}`) ? 'visible' : ''}`}
              >
                <div className="w-full md:w-5/12"></div>
                <div className="w-full md:w-2/12 flex justify-center">
                  <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-yellow-400 font-bold">{index + 1}</span>
                  </div>
                </div>
                <div className="w-full md:w-5/12 mt-4 md:mt-0">
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <h3 className="font-bold text-red-900 mb-2">{milestone.date}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{milestone.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
              <span className="text-red-900 font-bold text-2xl">PDM</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Pambayang Dalubhasaan ng Marilao</h3>
            <p className="text-yellow-200 italic">"Where quality education is a right - not a privilege"</p>
          </div>
          <div className="border-t border-white/20 pt-6">
            <p className="text-sm text-white/80">
              Copyright © 2025 Pambayang Dalubhasaan ng Marilao. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}