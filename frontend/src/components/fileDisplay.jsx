import React, { useRef, useState, useEffect } from "react";
import FileModal from "./fileModal.jsx";
import Popup from "../utils/popups.jsx";

export default function FileDisplay( {studentData} ) {
  // * API
  const EXPRESS_API = import.meta.env.VITE_EXPRESS_API;

  const [files, setFiles] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${EXPRESS_API}/files`);
      const data = await response.json();

      const allFilesDict = {};
      const catList = Object.keys(data.files);

      Object.entries(data.files).forEach(([category, obj]) => {
        obj.files.forEach((file) => {
          allFilesDict[file] = category;
        });
      });

      setFiles(allFilesDict);
      setCategories(catList);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleDeleteFile = (filename, folder) => {
    if (!window.confirm(`Delete "${filename}" from ${folder}?`)) return;

    fetch(
      `${EXPRESS_API}/delete_upload/${folder}/${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    )
      .then((res) => {
        if (res.ok) fetchFiles();
        else alert("Failed to delete file.");
      })
      .catch(() => alert("Failed to delete file."));
  };

  const handleFileChange = async (file, folder) => {
    if (!file) return;

    // ✅ Allowed file extensions
    const allowedExtensions = [".xlsx", ".json", ".pdf"];

    // Check if the file is one of the allowed types
    if (
      !allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    ) {
      alert(
        "Only Excel (.xlsx), JSON (.json), and PDF (.pdf) files are allowed ❌"
      );
      e.target.value = null;
      return;
    }

    // 👉 Ask where to upload
    if (
      !folder ||
      !["faculty", "students", "admin"].includes(folder.toLowerCase())
    ) {
      alert("❌ Invalid choice. Please select: faculty, students, or admin.");
      return;
    }

    if (onUploadStatus) onUploadStatus("start", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder.toLowerCase()); // ✅ send folder choice

    try {
      let response = await fetch("http://127.0.0.1:5000/v1/upload/file", {
        method: "POST",
        body: formData,
      });

      let result = await response.json();

      // Handle duplicates
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
          onFileUpload(file, {
            success: false,
            message: "Upload cancelled ❌",
          });
        }
        if (onUploadStatus) onUploadStatus("end", file);
        fetchFiles();
        return;
      }

      onFileUpload(file, { success: true, message: "Upload complete ✅" });
      showPopup("success", "✅ Upload complete ");

      fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      onFileUpload(file, { success: false, message: "Upload failed ❌" });
      showPopup("error", "❌ Upload failed ");
    }

    if (onUploadStatus) onUploadStatus("end", file);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    console.log("Categories", categories);
  }, [files]);
  return (
    <div className="w-full h-full text-amber-950 p-5">
      <div className="w-full h-full flex flex-col gap-10">
        <section className="w-full h-fit justify-between items-center flex flex-row">
          <div className="flex flex-col leading-tight">
            <h1 className="typo-header-bold">File Management</h1>
            <span className="typo-content-regular">
              Organize and manage files
            </span>
          </div>

          <button
            className="rounded-lg shadow-black/30 typo-buttons-semibold shadow-lg hover:bg-amber-400 duration-300 cursor-pointer bg-amber-300 h-fit py-[0.5vw] px-[2vw]"
            onClick={() => setIsModalOpen(true)}
          >
            Upload File
          </button>
        </section>

        <section className="w-full h-fit flex flex-col">
          <h1 className="typo-subheader-semibold">Categories</h1>
          <div className="w-full h-fit flex gap-2 overflow-x-auto">
            {/* All button */}
            <div
              onClick={() => setSelectedCategory("All")}
              className={`cursor-pointer w-full flex flex-col shadow-black/30 bg-gray-100 gap-2 rounded-lg border-black/30 border p-4
      ${selectedCategory === "All" ? "bg-amber-300 border-amber-600" : ""}`}
            >
              <img src="./navIco/folder.svg" className="w-[3vw]" />
              <span className="typo-content-regular">All Files</span>
            </div>

            {/* Category buttons */}
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer w-full flex flex-col shadow-black/30 bg-gray-100 gap-2 rounded-lg border border-black/30 p-4
        ${
          selectedCategory === category ? "bg-amber-300 border-amber-600" : ""
        }`}
              >
                <img src="./navIco/folder.svg" className="w-[3vw]" />
                <span className="typo-content-regular">{category}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full h-full flex flex-col">
          <h1 className="typo-subheader-semibold">Files</h1>
          <section className="w-full h-[calc(10vh+18vw)] flex flex-col !overflow-y-scroll gap-2">
            {Object.entries(files)
              .filter(
                ([fileName, category]) =>
                  selectedCategory === "All" || category === selectedCategory
              )
              .map(([fileName, category]) => (
                <div
                  key={fileName}
                  className="w-full h-fit flex flex-col p-4 rounded-2xl border-black/30 border gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h1 className="typo-content-semibold">{fileName}</h1>

                    <button
                      className="text-red-500 hover:text-red-700 cursor-pointer typo-buttons-regular"
                      onClick={() => handleDeleteFile(fileName, category)}
                    >
                      Delete
                    </button>
                  </div>

                  <h1 className="typo-content-regular text-gray-600">
                    {category}
                  </h1>
                </div>
              ))}
          </section>
        </section>
      </div>
      <FileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFileChange}
        studentData={studentData}
      />
      <Popup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ show: false, type: "", message: "" })}
      />
    </div>
  );
}
