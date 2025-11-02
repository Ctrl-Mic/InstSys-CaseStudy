import React, { useRef, useState, useEffect } from "react";
import FileDisplayCard from "./FileDisplayCard.jsx";
import FileModal from "./fileModal.jsx";
import Popup from "../utils/popups.jsx";
import FileTree from "./FileTree";

/* The above code is a React component named `FileUpload` that handles file uploads to a backend
server. Here is a summary of what the code does: */
const VALID_FOLDERS = [
  "students_data",
  "non_teaching_faculty",
  "teaching_faculty",
  "cor",
  "faculty_schedule",
  "grades",
  "admin",
  "curriculum",
  "generalinfo",
];

function FileUpload({ onFileUpload, onUploadStatus, studentData }) {
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "success", message: "" });
  const [uploadedFiles, setUploadedFiles] = useState({
    faculty: [],
    students: [],
    admin: [],
  });

  // Fetch files from backend uploads folder
  const fetchFiles = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/files");
      const data = await res.json();

      if (data.files) {
        setUploadedFiles(data.files); // Set the nested file structure
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setUploadedFiles({});
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Delete file handler
  const handleDeleteFile = (filename, folder) => {
    if (!window.confirm(`Delete "${filename}" from ${folder}?`)) return;
    fetch(`http://127.0.0.1:5000/delete_upload/${folder}/${encodeURIComponent(filename)}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) fetchFiles();
        else alert("Failed to delete file.");
      })
      .catch(() => alert("Failed to delete file."));
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });

    // auto-hide popup after 3s (optional)
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 3000);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (file, folder) => {
    if (!file) return;

    console.log("Uploading file:", file.name);
    console.log("Target folder:", folder);

    // ✅ Allowed file extensions
    const allowedExtensions = [".xlsx", ".json", ".pdf"];

    // Check if the file is one of the allowed types
    if (!allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      alert("Only Excel (.xlsx), JSON (.json), and PDF (.pdf) files are allowed ❌");
      return;
    }

    // 👉 Validate folder name
    if (!folder || !VALID_FOLDERS.includes(folder.toLowerCase())) {
      alert(`❌ Invalid choice. Please select one of: ${VALID_FOLDERS.join(", ")}`);
      return;
    }

    if (onUploadStatus) onUploadStatus("start", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder.toLowerCase()); // ✅ send folder choice
    formData.append("category", "test")

    try {
      // Step 1: Upload to MongoDB
      let response = await fetch("http://127.0.0.1:5000/v1/upload/file", {
        method: "POST",
        body: formData,
      });

      let result = await response.json();

      if (!response.ok) {
        console.error("MongoDB upload failed:", result.message);
        showPopup("error", "❌ MongoDB upload failed");
        return;
      }

      console.log("MongoDB upload successful:", result);

      // Step 2: Upload to Local Storage
      response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      result = await response.json();

      if (!response.ok) {
        console.error("Local upload failed:", result.message);
        showPopup("error", "❌ Local upload failed");
        return;
      }

      console.log("Local upload successful:", result);

      // Step 3: Handle duplicates (if any)
      if (response.status === 409 && result.duplicate) {
        const confirm = window.confirm(result.message);
        if (confirm) {
          const overwriteForm = new FormData();
          overwriteForm.append("file", file);
          overwriteForm.append("overwrite", "true");
          overwriteForm.append("folder", folder.toLowerCase()); // keep folder info
          response = await fetch("http://127.0.0.1:5000/upload", {
            method: "POST",
            body: overwriteForm,
          });
          result = await response.json();
          onFileUpload(file, { success: true, message: "File overwritten ✅" });
        } else {
          onFileUpload(file, { success: false, message: "Upload cancelled ❌" });
        }
        if (onUploadStatus) onUploadStatus("end", file);
        fetchFiles();
        return;
      }

      // Step 4: Finalize upload
      onFileUpload(file, { success: true, message: "Upload complete ✅" });
      showPopup("success", "✅ Upload complete");

      fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      onFileUpload(file, { success: false, message: "Upload failed ❌" });
      showPopup("error", "❌ Upload failed");
    }

    if (onUploadStatus) onUploadStatus("end", file);
  }


  return (
    <>
      <div className="w-full h-full flex flex-col items-center py-5 mr-2">
        {/* Header */}
        <div className=" w-full h-[10%] flex flex-col gap-2 items-center">
          <div className="flex justify-between w-[90%]">
            <div className="flex items-center">
              <div className="bg-[url('/navIco/iconAI.svg')] bg-contain bg-no-repeat w-[3vw] aspect-square"></div>
              <h1 className="text-[clamp(1.3rem,1.2vw,1.8rem)] font-sans font-medium">
                Intelligent System
              </h1>
            </div>
            <div className="flex gap-2 items-center">
              <h1 className="text-[clamp(1.3rem,1.2vw,1.8rem)] font-sans font-medium">
                {studentData ? `${studentData.firstName} ${studentData.lastName}` : "User Account"}
              </h1>
              <div className="bg-[url('/navIco/profile-circle.svg')] bg-contain bg-no-repeat w-[3vw] aspect-square"></div>
            </div>
          </div>
          <div className="w-[90%] h-1 rounded-2xl bg-gray-500"></div>
        </div>
        {/* Main Documents */}
        <h1 className="self-start ml-6 mb-2 text-[clamp(1.8rem,1.8vw,2.5rem)] font-sans font-medium">
          FILES UPLOADED
        </h1>
        
        <div className="overflow-auto h-[75%] w-[90%] rounded-lg p-4 relative scrollbar-hide">
          {/* <h1 className="text-2xl font-bold mb-4">Uploaded Files</h1> */}
          <FileTree files={uploadedFiles} onDelete={handleDeleteFile} />
        </div>

        {/* Add Button */}
        <FileModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFileChange}
          studentData={studentData}
        />
        <div className="absolute right-10 bottom-10">
          {/* onClick={handleFileClick} */}
          <button className="nav w-auto" onClick={() => setIsModalOpen(true)}>
            <img
              src="/navIco/addFile.svg"
              alt="Upload"
              className="navBtn w-[7vw] aspect-square"
            />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            // onChange={handleFileChange}
          />
        </div>
        <Popup
          show={popup.show}
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup({ show: false, type: "", message: "" })}
        />
      </div>
    </>
  );
}

export default FileUpload;