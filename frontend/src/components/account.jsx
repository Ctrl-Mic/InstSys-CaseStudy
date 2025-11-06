import React from "react";

const courseMap = {
  BSCS: "Bachelor of Science in Computer Science (BSCS)",
  BSIT: "Bachelor of Science in Information Technology (BSIT)",
  BSHM: "Bachelor of Science in Hospitality Management (BSHM)",
  BSTM: "Bachelor of Science in Tourism Management (BSTM)",
  BSOAd: "Bachelor of Science in Office Administration (BSOAd)",
  BECEd: "Bachelor of Early Childhood Education (BECEd)",
  BTLEd: "Bachelor of Technology in Livelihood Education (BTLEd)",
};

export default function Account({ studentData }) {
  if (!studentData) {
    return <div className="p-4 text-xl">No student data found.</div>;
  }

  const fullCourse = courseMap[studentData.course] || studentData.course;

  return (
    <div className="w-full h-full gap-5 p-4 flex flex-col">
      <div className="flex gap-4 p-3 shadow-md bg-gray-100/70 rounded-lg w-full h-[20%] items-center">
        <img
          src={studentData.img}
          alt="test"
          className="h-full aspect-square bg-white shadow-lg rounded-full flex-shrink-0 object-cover"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-medium">
            {studentData.firstName} {studentData.lastName}
          </h1>
          <h2 className="text-3xl">{studentData.role}</h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5 shadow-md bg-gray-100/70 rounded-lg w-full h-[20%]">
        <h1 className="text-3xl font-bold">FULL NAME</h1>
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-medium">{studentData.firstName}</h1>
            <h2 className="text-2xl">First Name</h2>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-medium">{studentData.middleName}</h1>
            <h2 className="text-2xl">Middle Name</h2>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-medium">{studentData.lastName}</h1>
            <h2 className="text-2xl">Last Name</h2>
          </div>
        </div>
      </div>

      <div className="flex gap-4 p-5 shadow-md bg-gray-100/70 rounded-lg w-full h-[35%]">
        <div className="flex flex-col gap-3 justify-between">
          <h1 className="text-3xl font-medium">INFORMATION</h1>
          <div className="flex flex-col p-2">
            <div className="flex flex-col my-1.5">
              <h1 className="text-3xl">Student Number</h1>
              <p className="text-2xl font-medium">{studentData.studentId}</p>
            </div>
            <div className="flex flex-col my-1.5">
              <h1 className="text-3xl">Course</h1>
              <p className="text-2xl font-medium">{fullCourse}</p>
            </div>
            <div className="flex flex-col my-1.5">
              <h1 className="text-3xl">Email Address</h1>
              <p className="text-2xl font-medium">{studentData.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 p-3 shadow-md bg-gray-100/70 rounded-lg w-full h-[20%]">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium">
            Additional Student Information
          </h1>
          {/* Add any additional info here */}
        </div>
      </div>
    </div>
  );
}
