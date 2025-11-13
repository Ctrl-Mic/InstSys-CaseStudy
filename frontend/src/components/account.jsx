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
  <div className="w-full h-full flex justify-center p-6">
    <div className="w-[70%] flex flex-col gap-6">

<<<<<<< Updated upstream
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
=======
      {/* PROFILE CARD */}
      <div className="w-full bg-white rounded-2xl shadow-md flex items-center gap-6 px-8 py-6 mx-auto">
        <div className="h-20 w-20 bg-yellow-500 rounded-full shadow-md flex items-center justify-center text-3xl font-semibold text-white">
          {studentData.firstName?.[0]?.toUpperCase()}
          {studentData.lastName?.[0]?.toUpperCase()}
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold text-[#4b2e05] leading-tight">
            {studentData.firstName?.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
            {studentData.lastName?.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
          </h1>
          <h2 className="text-lg text-gray-600">{studentData.role}</h2>
>>>>>>> Stashed changes
        </div>
      </div>

      {/* FULL NAME CARD */}
      <div className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 mx-auto">
        <h1 className="text-2xl font-semibold text-[#4b2e05]">Full Name</h1>

        <div className="flex justify-between px-1">
          <div className="flex flex-col">
            <p className="text-xl font-medium leading-tight">
              {studentData.firstName?.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
            <span className="text-gray-500 text-sm">First Name</span>
          </div>

          <div className="flex flex-col">
            <p className="text-xl font-medium leading-tight">
              {studentData.middleName?.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
            <span className="text-gray-500 text-sm">Middle Name</span>
          </div>

          <div className="flex flex-col">
            <p className="text-xl font-medium leading-tight">
              {studentData.lastName?.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
            <span className="text-gray-500 text-sm">Last Name</span>
          </div>
        </div>
      </div>

      {/* INFORMATION CARD */}
      <div className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 mx-auto">
        <h1 className="text-2xl font-semibold text-[#4b2e05]">Information</h1>

        <div>
          <h2 className="text-lg text-gray-600">Student Number</h2>
          <p className="text-xl font-medium">{studentData.studentId}</p>
        </div>

        <div>
          <h2 className="text-lg text-gray-600">Course</h2>
          <p className="text-xl font-medium">{fullCourse}</p>
        </div>

        <div>
          <h2 className="text-lg text-gray-600">Email Address</h2>
          <p className="text-xl font-medium">{studentData.email}</p>
        </div>
      </div>

<<<<<<< Updated upstream
      <div className="flex gap-4 p-3 shadow-md bg-gray-100/70 rounded-lg w-full h-[20%]">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium">
            Additional Student Information
          </h1>
          {/* Add any additional info here */}
        </div>
=======
      {/* EXTRA INFORMATION CARD */}
      <div className="w-full bg-white rounded-2xl shadow-md p-6 mx-auto">
        <h1 className="text-2xl font-semibold text-[#4b2e05]">
          Additional Student Information
        </h1>
>>>>>>> Stashed changes
      </div>

    </div>
  </div>
);

}
