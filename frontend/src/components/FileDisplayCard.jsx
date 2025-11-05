import React, { useState, useEffect, useRef } from "react";

export default function FileDisplayCard({ folder, filename, onDelete }) {
  const fileType = filename.split(".").pop();

  return (
    <div className="border rounded-lg p-3 shadow-sm bg-white flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{filename}</h3>
        <p className="text-sm text-gray-500">Folder: {folder}</p>
        <p className="text-sm text-gray-400">Type: .{fileType}</p>
      </div>
      
      <button 
        onClick={() => onDelete(filename, folder)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
      >
        Delete
      </button>
    </div>
  );
}
