import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/chatPrompt.css";
import FileUpload from "../components/FileUpload";
import ChatModel from "./chatModel.jsx";
import FileDisplay from "../components/fileDisplay.jsx";
import AiChat from "./aiChat";
import Courses from "./courses";
import Account from "../components/account";
import { motion } from "framer-motion";
import VoiceInput from "../utils/voiceInput.jsx";

function ChatPrompt({ goDashboard, initialView = "chat" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const boxRef = useRef(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(initialView);
  const [aiText, setAiText] = useState("");
  const navigate = useNavigate();
  // =============================
  // Fetch student data on load
  // =============================
  useEffect(() => {
    const loggedInId = localStorage.getItem("studentId");
    if (loggedInId) {
      setLoading(true);
      fetch(`http://localhost:5000/student/${loggedInId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setStudentData(data);
          else setStudentData(null);
        })
        .catch((err) => {
          console.error("Error fetching student:", err);
          setStudentData(null);
        })
        .finally(() => setLoading(false));
    } else {
      setStudentData(null);
      setLoading(false);
    }
  }, []);

  // Update when student data changes
  useEffect(() => {
    console.log("studentData state:", studentData);
  }, [studentData]);

  // Sync with external initialView
  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  // =============================
  // Send Message Handler
  // =============================
  const sendMessage = (text) => {
    console.log("Sending message:", text);
    setMessages((prev) => [...prev, { sender: "user", text }]);

    const isScheduleRequest = text.toLowerCase().includes("schedule");
    const isPersonRequest = text.toLowerCase().includes("who");
    const isRecordRequest = text.toLowerCase().includes("record");

    const loadingMsg = { sender: "bot", text: "Thinking...", type: "loading" };
    setMessages((prev) => [...prev, loadingMsg]);

    // Call Flask backend
    fetch("http://localhost:5000/chatprompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text }),
    })
      .then((res) => res.json())
      .then((data) => {
        const textClean = (data.response || "No Response From the AI").replace(
          /\s*(\[[^\]]*\]\s*)+$/,
          ""
        );
        setAiText(textClean);
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.type !== "loading");
          return [
            ...filtered,
            {
              sender: "bot",
              text: textClean,
              type: isScheduleRequest
                ? "schedule"
                : isRecordRequest
                ? "record"
                : isPersonRequest
                ? "who"
                : "defaultRes",
            },
          ];
        });
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Sorry, there was an error connecting to the AI.",
            type: "defaultRes",
          },
        ]);
      });
  };

  // =============================
  // Other Handlers
  // =============================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleVoiceSubmit = (text) => {
    if (!text.trim()) return;
    sendMessage(text);
    setInput("");
  };

  const handleFileSelect = (file, result) => {
    console.log("File uploaded:", file.name, result.message);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTo({
        top: boxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // =============================
  // Role Helpers
  // =============================
  const rawRole = (studentData?.role ?? localStorage.getItem("role") ?? "")
    .trim()
    .toLowerCase();
  const isStudent = rawRole.startsWith("student");
  const isGuest = rawRole === "guest";
  const isFaculty = rawRole === "faculty";

  // Animation variants
  const childVariants = {
    hidden: { opacity: 0.2, x: -10 },
    visible: (delay = 0) => ({
      opacity: 1,
      x: 0,
      transition: { delay, duration: 0.4, ease: "easeOut" },
    }),
  };

  // Loading and fallback states
  if (loading) return <div className="w-screen h-screen bg-white"></div>;
  if (!studentData)
    return (
      <div className="w-screen h-screen items-center justify-center bg-white">
        No student data found. Please log in again.
      </div>
    );

  // =============================
  // Main JSX
  // =============================
  return (
    <div className="flex flex-col items-center justify-between w-[100vw] h-screen">
      {/* NAVIGATION BAR */}
      <div className="text-white px-[1rem] py-[0.5rem] justify-between w-full h-fit flex flex-row bg-[#792C1A] backdrop-blur-sm items-center border-b-2 border-amber-400">
        <div className="flex items-center gap-1">
          <img src="./images/PDM-Logo.svg" alt="PDM Logo" className="w-[5%]" />
          <h1 className="typo-subheader-semibold">
            <span className="text-amber-300">Information</span>System
          </h1>
        </div>
        <div className="flex items-center gap-5 typo-buttons-semibold">
          <a
            onClick={() => navigate("/dashboard")}
            href="#Account"
            className="flex items-center w-fit hover:scale-102 duration-200 hover:underline"
          >
            {" "}
            <img
              className="w-5 h-5 mr-2 aspect-square"
              src="./navIco/house.svg"
              alt="Account Icon"
            />{" "}
            home
          </a>
          <a
            onClick={() => setActiveView("chat")}
            href="#Chat"
            className="flex items-center w-fit hover:scale-102 duration-200 hover:underline"
          >
            {" "}
            <img
              className="w-5 h-5 mr-2 aspect-square"
              src="./navIco/bot-message-square.svg"
              alt="Chat Icon"
            />{" "}
            Ai Chat
          </a>
          {!(isStudent || isGuest) && (
            <div className="flex gap-5">
              <a
                onClick={() => setActiveView("file")}
                href="#File_Management"
                className="flex items-center w-fit hover:scale-102 duration-200 hover:underline"
              >
                {" "}
                <img
                  className="w-5 h-5 mr-2 aspect-square"
                  src="./navIco/folder-open.svg"
                  alt="Folder Icon"
                />{" "}
                File Management
              </a>
              <a
                onClick={() => setActiveView("courses")}
                href="#Programs_&_Courses"
                className="flex items-center w-fit hover:scale-102 duration-200 hover:underline"
              >
                {" "}
                <img
                  className="w-5 h-5 mr-2 aspect-square"
                  src="./navIco/graduation-cap.svg"
                  alt="Program Icon"
                />{" "}
                Programs & Courses
              </a>
              {/* TODO: Add a CMS page here */}
              <a
                onClick={() => setActiveView("account")}
                href="#Account"
                className="flex items-center w-fit hover:scale-102 duration-200 hover:underline"
              >
                {" "}
                <img
                  className="w-5 h-5 mr-2 aspect-square"
                  src="./navIco/chat-user.svg"
                  alt="Account Icon"
                />{" "}
                Account
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mainContent flex flex-col bg-gray-100 w-full h-screen">
        {activeView === "chat" && (
          <div className="flex w-full h-full">
            <ChatModel />
          </div>
        )}
        {activeView === "file" && (
          <div className="w-full h-full p-2 bg-gray-100 ">
            <FileDisplay studentData={studentData} />
          </div>
        )}
        {activeView === "courses" && (
          <div className="w-full h-full p-2 bg-gray-100 ">
            <Courses studentData={studentData} />
          </div>
        )}
        {activeView === "account" && (
          <div className="w-full h-full p-2 bg-gray-100 ">
            <Account studentData={studentData} />
          </div>
        )}

        {/* <div
          className={`${
            activeView === "chat" ? "flex" : "hidden"
          }`}
        >
          <ChatModel></ChatModel>
        </div>
        
        <div
          className={`${
            activeView === "file" ? "flex" : "hidden"
          }`}
        >
          <FileUpload
            studentData={studentData}
            onFileUpload={handleFileSelect}
          />
        </div> */}
        {/* <div className="main flex flex-col gap-2 justify-center items-center w-full h-screen">
          <div
            className={`${
              activeView === "chat" ? "flex" : "hidden"
            } w-full h-full overflow-hidden justify-center items-center`}
          >
            <AiChat
              studentData={studentData}
              messages={messages}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              boxRef={boxRef}
              sendMessage={sendMessage}
              response={aiText}
            />
          </div>

          <div
            className={`${
              activeView === "upload" ? "flex" : "hidden"
            } w-full h-full justify-center items-center`}
          >
            <FileUpload
              studentData={studentData}
              onFileUpload={handleFileSelect}
            />
          </div>

          <div
            className={`${
              activeView === "courses" ? "flex" : "hidden"
            } w-full h-full justify-center items-center`}
          >
            <Courses studentData={studentData} />
          </div>

          <div
            className={`${
              activeView === "account" ? "flex" : "hidden"
            } w-full h-full justify-center items-center`}
          >
            <Account studentData={studentData} />
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default ChatPrompt;
