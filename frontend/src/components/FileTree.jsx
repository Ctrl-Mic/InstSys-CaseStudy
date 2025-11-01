import React from "react";
import FileDisplayCard from "./FileDisplayCard";

function FileTree({ files, folderName, onDelete }) {
  return (
    <div className="file-tree">
      {folderName && <h2 className="font-bold text-lg">{folderName}</h2>}
      <div className="flex flex-wrap gap-4">
        {files.files &&
          files.files.map((file) => (
            <FileDisplayCard
              key={file}
              filename={file}
              onDelete={() => onDelete(file, folderName)}
            />
          ))}
      </div>
      {Object.keys(files)
        .filter((key) => key !== "files")
        .map((subfolder) => (
          <div key={subfolder} className="ml-4">
            <FileTree
              files={files[subfolder]}
              folderName={subfolder}
              onDelete={onDelete}
            />
          </div>
        ))}
    </div>
  );
}

export default FileTree;