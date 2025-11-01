import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

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
    "Test 1",
    "Test 2",
    "Test 3",
    "Test 4",
    "Test 1",
    "Test 2",
    "Test 3",
    "Test 4",
    "Test 1",
    "Test 2",
    "Test 3",
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-black text-3xl font-bold mb-6">OBJECTIVES</h1>

      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={2.5} // ⭐ Instead of "auto"
        spaceBetween={100}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 150,
          modifier: 2.5,
          slideShadows: false, // ⭐ removes ugly shadow
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        modules={[Autoplay, EffectCoverflow, Pagination, Navigation]}
        className="w-full" // ⭐ keeps slider centered
      >
        {items.map((text, index) => (
          <SwiperSlide key={index} className="flex justify-center items-center">
            <div className="w-full aspect-video bg-gray-200/60 backdrop-blur-3xl border-amber-400/30 border-2 text-black flex justify-center items-center rounded-xl shadow-lg">
              {text}
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination z-50"></div>
      </Swiper>
    </div>
  );
}
