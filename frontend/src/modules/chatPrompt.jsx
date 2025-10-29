import React, { useState, useEffect, useRef } from "react";
import "../css/chatPrompt.css";
import FileUpload from "../components/FileUpload";
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
  if (loading)
    return <div className="w-screen h-screen bg-white">Loading...</div>;
  if (!studentData)
    return (
      <div className="w-screen h-screen bg-white">
        No student data found. Please log in again.
      </div>
    );

  // =============================
  // Main JSX
  // =============================
  return (
    <div className="chat-prompt w-full h-full p-0 m-0">
      <div className="mainContent flex h-full justify-center items-center">
        {/* NAV BAR */}
        <motion.div
          variants={childVariants}
          custom={0.1}
          initial="hidden"
          animate="visible"
          className="navBar w-full h-full flex flex-col bg-[#792C1A] justify-around z-10"
        >
          <div className="flex flex-col h-full justify-between gap-5 px-[8%] py-7">
            <div className="w-full h-fit flex flex-col gap-4">
              <div className="flex gap-[2%] items-center">
                <button className="nav w-auto !py-4">
                  <img
                    src="./public/images/PDM-Logo.svg"
                    alt="PDM-LOGO"
                    className="navBtn w-[6vw] aspect-square"
                  />
                </button>
                <h1 className="text-white font-sans text-[clamp(1rem,3vw,4rem)] font-bold">
                  PDM
                </h1>
              </div>
              <div className="w-full rounded-2xl h-1 bg-gray-400"></div>

              <div
                onClick={() => setActiveView("chat")}
                className="w-full flex items-center h-[5vh] hover:scale-103 transition-all duration-300 cursor-pointer"
              >
                <button onClick={() => setActiveView("chat")}>
                  <img
                    src="/navIco/chatBox.svg"
                    alt=""
                    className="w-[80%] aspect-square cursor-pointer"
                  />
                </button>
                <h1 className="text-white text-[clamp(1rem,1.2vw,1.5rem)] ">
                  Smart System
                </h1>
              </div>

              {!(isStudent || isGuest) && (
                <div
                  onClick={() => setActiveView("upload")}
                  className="w-full flex items-center h-[5vh] hover:scale-103 transition-all duration-300 cursor-pointer"
                >
                  <button onClick={() => setActiveView("upload")}>
                    <img
                      src="/navIco/loadedFiles.svg"
                      alt=""
                      className="w-[80%] aspect-square cursor-pointer"
                    />
                  </button>
                  <h1 className="text-white text-[clamp(1rem,1.2vw,1.5rem)] ">
                    Loaded Files
                  </h1>
                </div>
              )}

              {!(isStudent || isGuest || isFaculty) && (
                <>
                  <div
                    onClick={() => setActiveView("courses")}
                    className="w-full flex items-center h-[5vh] hover:scale-103 transition-all duration-300 cursor-pointer"
                  >
                    <button onClick={() => setActiveView("courses")}>
                      <img
                        src="/navIco/programs.svg"
                        alt=""
                        className="w-[80%] aspect-square cursor-pointer"
                      />
                    </button>
                    <h1 className="text-white text-[clamp(1rem,1.2vw,1.5rem)] ">
                      Programs
                    </h1>
                  </div>

                  <div
                    onClick={() => setActiveView("create")}
                    className="w-full flex items-center h-[5vh] hover:scale-103 transition-all duration-300 cursor-pointer"
                  >
                    <button onClick={() => setActiveView("create")}>
                      <img
                        src="/navIco/createAcc.svg"
                        alt=""
                        className="w-[80%] aspect-square cursor-pointer"
                      />
                    </button>
                    <h1 className="text-white text-[clamp(1rem,1.2vw,1.5rem)] ">
                      Create Account
                    </h1>
                  </div>
                </>
              )}
            </div>

            <div className="w-full h-fit flex flex-col gap-4">
              <div className="w-full rounded-2xl h-1 bg-gray-400"></div>

              <div
                onClick={() => setActiveView("account")}
                className="w-full flex items-center h-[5vh] hover:scale-103 transition-all duration-300 cursor-pointer"
              >
                <button className="nav w-auto !py-4">
                  <img
                    src="./navIco/user.svg"
                    alt="PDM-LOGO"
                    className="w-[80%] aspect-square cursor-pointer"
                  />
                </button>
                <h1 className="text-white text-[clamp(1rem,1.2vw,1.5rem)] ">
                  Account
                </h1>
              </div>

              <div
                onClick={goDashboard}
                className="w-full flex items-center h-[5vh] hover:scale-103 transition-all duration-300 cursor-pointer"
              >
                <button onClick={goDashboard}>
                  <img
                    src="/navIco/user.svg"
                    alt=""
                    className="w-[80%] aspect-square cursor-pointer"
                  />
                </button>
                <h1 className="text-white text-[clamp(1rem,1.2vw,1.5rem)] ">
                  Dashboard
                </h1>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAIN VIEW AREA */}
        <div className="main flex flex-col gap-2 justify-center items-center w-full h-screen">
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
        </div>
      </div>
    </div>
  );
}

export default ChatPrompt;
