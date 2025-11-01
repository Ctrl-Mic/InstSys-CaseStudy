import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation"; // <-- add this too

import {
  Autoplay,
  EffectCoverflow,
  Pagination,
  Navigation,
} from "swiper/modules";

export default function Objectives() {
  const items = [
    "Inculcate among students and all stakeholders a culture of excellence by communicating the school vision and mission across all sectors of the college;",
    "Impart knowledge through effective instruction delivered by a core of qualified and competent faculty;",
    "Offer relevant degree and non-degree programs that are responsive to the current needs;",
    "Instill social awareness among all stakeholders through relevant and worthwhile community extension programs;",
    "Nurture talents and skills of students through various social, cultural, and co-curricular activities;",
    "Assist students through provision of support services that will address varied needs and concerns",
    "Tap and mold future leaders through active student involvement;",
    "Adapt to the changes in the society through continuing professional education of the teaching and non-teaching force;",
    "Contribute to the development of new knowledge through researches;",
    "Strengthen skills and capabilities of students through relevant exposure and establishment of linkages;",
    "Inculcate virtues of goodwill, integrity, nationalism, and pride in our heritage as a people.",
  ];

  useGSAP(() => {
    gsap.from(".main-title", {
      yPercent: 130,
      duration: 0.7,
      stagger: 0,
      ease: "circ",
      scrollTrigger: {
        trigger: ".main-title",
        start: "top 90%"
      }
    })
  }, [])

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      <div className="border-b-5 border-amber-800 overflow-hidden">
        <h1 className="main-title text-white typo-header-bold">OBJECTIVES</h1>
      </div>

      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={1.5} // ⭐ Instead of "auto"
        spaceBetween={50}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 2.5,
          slideShadows: false, // ⭐ removes ugly shadow
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
        className="w-full" // ⭐ keeps slider centered
      >
        {items.map((text, index) => (
          <SwiperSlide key={index} className="flex justify-center items-center">
            <div className="w-full p-[2vw] pb-[4vw] text-center typo-content-regular h-[100%] bg-white/30 backdrop-blur-xl border-white border-1 text-amber-950 flex justify-center items-center hover:bg-white/40 transition-all rounded-xl shadow-lg">
              <div className="pointer-events-none flex flex-col gap-5 items-center">
                <div className="w-[2vw] aspect-square bg-amber-800 text-white rounded-full text-center items-center shadow-black/40 shadow-md">
                  {index+1}
                </div>
                {text}
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination z-50"></div>
      </Swiper>
    </div>
  );
}
