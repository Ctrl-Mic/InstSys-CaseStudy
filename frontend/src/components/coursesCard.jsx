import React from "react";

export default function CoursesCard({ department, program, description, image }) {
  return (
    <div className='flex gap-3 w-full h-[30%] p-3 rounded-xl border-black/30 border'>
      <div className='w-[10%] aspect-square rounded-md bg-white'>
        {image && <img src={image} alt={program} className="object-cover w-full h-full rounded-md" />}
      </div>
      <div className='flex flex-col text-amber-950 justify-center gap-5 w-[80%] h-full'>
        <h1 className='typo-content-semibold font-sans font-medium'>{department}</h1>
        <h2 className='typo-content-regular font-sans '>{program}</h2>
        <p className='typo-content-regular font-sans font-light wrap-break-word '>{description}</p>
      </div>
    </div>
  );
}
