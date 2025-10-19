const { MongoClient, ObjectId } = require('mongodb');
const XLSX = require('xlsx');
const fs = require('fs');
let pdfParse = require('pdf-parse');
pdfParse = pdfParse.default || pdfParse;

const url = 'mongodb://localhost:27017/';
const client = new MongoClient(url);

async function xlsxFormat(fileBuffer) {

  try {

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);

  } catch (error) {
    console.log('Error converting xlsx', error.message);
  }

}

async function pdfFormat(buffer) {

  try {

    return await pdfParse(buffer);

  } catch (error) {
    console.log('Error converting pdf', error.message);
  }
}

async function retrieve_file() {
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