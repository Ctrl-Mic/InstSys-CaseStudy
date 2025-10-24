import StudentDatabase from './src/modules/modules.StudentDatabase.js';
import StudentDataExtractor from './src/modules/extractor/extractor.StudentData.js';
import NonTeachingFacultyExtractor from './src/modules/extractor/extractor.NonTeachingFaculty.js';
import TeachingFacultyExtractor from './src/modules/extractor/extractor.TeachingFaculty.js';
import CORExcelExtractor from './src/modules/extractor/extractor.COR.js';
import { StudentSchema } from './src/components/constructor.js';
import retrieve_file from './src/modules/modules.requestFile.js';

class Connector {
  constructor(connectionString = null) {
    this.db = new StudentDatabase(connectionString);

    this.NonTeachingFacultyExtractor = new NonTeachingFacultyExtractor();
    this.TeachingFacultyExtractor = new TeachingFacultyExtractor();
    this.CORExcelExtractor = new CORExcelExtractor();
  }

  async DataTransfer() {
    try {

      await this.db.connect();

      const fileDataArray = await retrieve_file();
      if (!fileDataArray || fileDataArray.length === 0) {
        console.log("No data returned from database");
        return [];
      }

      for (const data of fileDataArray) {

        if (data.file_name?.endsWith('.xlsx') || data.fileType?.includes('spreadsheet')) {
          await this.NonTeachingFacultyExtractor.processNonTeachingFacultyExcel(data.text, data.file_name, this.db);
          await this.TeachingFacultyExtractor.processTeachingFacultyExcel(data.text, this.db);
          await this.CORExcelExtractor.processCORExcel(data.text, this.db);
          await StudentDataExtractor.processExcel(data.text, this.db);
        }
      }

    } catch (error) {
      console.error('DataTransfer error:', error.message);
      throw error;
    } finally {
      await this.db.close();
    }

  }

  async clearAllData() {
    try {
      await this.db.clearAllData();

    } catch (error) {
      console.error(`Error clearing data: ${error.message}`);
    }
  }

  async manualEntry(studentData = {}) {

    const cleanedData = {};

    for (const field in StudentSchema) {
      if (!studentData[field]) {
        console.warn(`Missing field: ${field}`);
        continue;
      }

      let value = studentData[field];

      if (['course', 'section'].includes(field)) {
        value = value.toUpperCase().trim();
      } else if (['surname', 'first_name', 'guardian_name'].includes(field)) {
        value = value.titleCase(value.trim());
      } else {
        value = String(value).trim();
      }

      cleanedData[field] = value;

    }

    if (studentData.surname && studentData.first_name) {
      studentData.full_name = `${studentData.surname}, ${studentData.first_name}`;
    }

    if (studentData.course) {
      studentData.department = StudentDataExtractor.detectDepartment(studentData.course);
    }

    const result = await this.db.createStudentRecord(studentData, 'manual_input');

  }

  titleCase(str) {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

export default Connector;