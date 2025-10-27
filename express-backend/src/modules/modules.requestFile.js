import { MongoClient, ObjectId } from 'mongodb';
import XLSX from 'xlsx';
import PDFParser from "pdf2json";

const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);

async function xlsxFormat(fileBuffer) {

  try {

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    return workbook.Sheets[sheetName];
    

  } catch (error) {
    console.log('Error converting xlsx', error.message);
  }

}

async function pdfFormat(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
      try {
        const text = pdfData.Pages.map(page =>
          page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n");
        resolve({ text });
      } catch (err) {
        reject(err);
      }
    });
    pdfParser.parseBuffer(buffer);
  });
}

export async function retrieve_file() {
  try {
    await client.connect();

    const database = client.db('school_system');
    const collection = database.collection('files');

    const fileDocuments = await collection.find().toArray();

    if (!fileDocuments.length) {
      console.log('❌ No files found in MongoDB');
      return [];
    }



    const results = [];

    for (const doc of fileDocuments) {
      const fileBuffer = Buffer.from(doc.file.buffer);
      if (!fileBuffer) {
        console.log(` Skipping ${doc._id}: Missing buffer`);
        continue;
      }

      let parsedData = null;

      if (
        doc.file_name?.endsWith('.xlsx') ||
        doc.fileType?.includes('spreadsheet')
      ) {
        parsedData = await xlsxFormat(fileBuffer);
      } else if (doc.fileType === 'application/pdf') {
        const pdfData = await pdfFormat(fileBuffer);
        parsedData = pdfData.text;
      } else {
        console.log(` Unsupported file type: ${doc.fileType}`);
        continue;
      }

      results.push({
        _id: doc._id,
        file_name: doc.file_name,
        fileType: doc.fileType,
        text: parsedData,
        file_category: doc.file_category,
      });
    }

    return results;

  } catch (error) {
    console.log('Error retrieving file:', error.message);
  } finally {
    await client.close();
  }
}

export default retrieve_file;