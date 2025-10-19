const fs = require('fs');
const path = require('path');
const { connection, upload } = require('./connection'); // update the path if needed

(async () => {
  try {
    await connection();

    // Simulate reading a file (PDF, XLSX, or any file)
    const filePath = path.join('./', 'missio&vision.pdf'); // replace with your test file
    const fileBuffer = fs.readFileSync(filePath);

    const testFile = {
      file: fileBuffer,                         // actual file buffer
      file_name: path.basename(filePath),       // e.g. 'sample.pdf'
      fileType: 'application/pdf',              // you can update this depending on the file
      uploadedAt: new Date(),                   // optional: extra metadata
    };

    const result = await upload(testFile);
    console.log("Upload Result:", result);

  } catch (err) {
    console.error("Test failed:", err.message);
  }
})();
