import React, { useState, useEffect } from "react";
import CoursesCard from "../components/coursesCard";
import CourseModal from "../components/courseModal";

export default function Courses({ studentData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);

  // Fetch courses from backend on mount
  useEffect(() => {
    fetch("http://localhost:5000/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(() => setCourses([]));
  }, []);

  const handleAddCourse = (course) => {
    fetch("http://localhost:5000/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(course),
    }).then((res) => {
      if (res.ok) setCourses((prev) => [...prev, course]);
    });
  };

  return (
    <>
      <div className="w-full h-full flex flex-col gap-5 p-5">
        <CourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddCourse={handleAddCourse}
        />
        <div className="w-full items-center justify-between flex flex-row">
          <div className="flex flex-col text-amber-950 leading-tight">
            <h1 className="typo-header-bold">Courses and Programs</h1>
            <span className="typo-content-regular">
              Organize and manage courses
            </span>
          </div>
          {studentData?.role?.toLowerCase() !== "faculty" && (
          <button
            className="rounded-lg shadow-black/30 typo-buttons-semibold shadow-lg hover:bg-amber-400 duration-300 cursor-pointer bg-amber-300 h-fit py-[0.5vw] px-[2vw]"
            onClick={() => setIsModalOpen(true)}
          >
            Add Course
          </button>
          )}
        </div>
        <div className=" flex flex-col gap-3 w-full h-[70vh] overflow-y-scroll scrollbar-hide">
          {courses.map((course, idx) => (
            <CoursesCard key={idx} {...course} />
          ))}
        </div>
      </div>
    </>
  );
}
