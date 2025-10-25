import StudentDatabase from './src/modules/modules.StudentDatabase.js';
import StudentDataExtractor from './src/modules/extractor/extractor.StudentData.js';
import NonTeachingFacultyExtractor from './src/modules/extractor/extractor.NonTeachingFaculty.js';
import NonTeachingFacultyManager from './src/modules/manager/manager.NonTeachingFaculty.js'
import TeachingFacultyExtractor from './src/modules/extractor/extractor.TeachingFaculty.js';
import TeachingFacultyManager from './src/modules/manager/manager.TeachingFacultyManager.js';
import CORExcelExtractor from './src/modules/extractor/extractor.COR.js';
import TeachingFacultyScheduleExtractor from './src/modules/extractor/extractor.TeachingFacultySchedule.js';
import StudentGradesExtractor from './src/modules/extractor/extractor.GRADES.js';
import StudentGradesManager from './src/modules/manager/manager.StudentGrades.js';
import { StudentSchema } from './src/components/constructor.js';
import retrieve_file from './src/modules/modules.requestFile.js';

class Connector {
  constructor(connectionString = null) {
    this.db = new StudentDatabase(connectionString);

    this.NonTeachingFacultyExtractor = new NonTeachingFacultyExtractor();
    this.TeachingFacultyExtractor = new TeachingFacultyExtractor();
    this.TeachingFacultyManager = new TeachingFacultyManager();
    this.CORExcelExtractor = new CORExcelExtractor();
    this.FacultySchedule = new TeachingFacultyScheduleExtractor();
    this.GradesExtractor = new StudentGradesExtractor();
    this.GradesManager = new StudentGradesManager();
    this.NonTeachingManager = new NonTeachingFacultyManager();

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
          if (category === 'Students') {
            try {
              await StudentDataExtractor.processExcel(data.text, this.db);

            } catch (error) {
              console.log("Error processing the Student Data", error.message);
            }

          } else if (category === 'Non_Teaching_Faculty') {

            try {
              const NonTeachingFacultyData = await this.NonTeachingFacultyExtractor.processNonTeachingFacultyExcel(data.text, data.file_name, this.db);
              if (NonTeachingFacultyData) {
                await this.nonTeachingFacultyManager.storeNonTeachingFaculty(facultyData);
              } else {
                console.log("Non Teaching Faculty has No extracted Data");
              }


            } catch (error) {
              console.log('Error processing the Non Teaching Faculty file', error.message);
            }


          } else if (category === 'Teaching_Faculty') {
            try {

              const TeachingFacultyData = await this.TeachingFacultyExtractor.processTeachingFacultyExcel(data.text, this.db);
              if (TeachingFacultyData) {
                await this.TeachingFacultyManager.storeTeachingFaculty(facultyData);
              } else {
                console.log("Teaching Faculty has No extracted Data");
              }

            } catch (error) {
              console.log('Error processing the Teaching Faculty file', error.message);
            }

          } else if (category === 'COR') {
            try {

              const CORData = await this.CORExcelExtractor.processCORExcel(data.text, this.db);
              if (CORData) {
                await this.corManager.storeCORSchedule(CORData);
              } else {
                console.log("COR has No extracted Data");
              }
            } catch (error) {
              console.log('Error processing the COR file', error.message);
            }

          } else if (category === 'Faculty_Schedule') {
            try {
              const FacultyScheduleData = await this.FacultySchedule.processTeachingFacultyScheduleExcel(data.text);
              if (FacultyScheduleData) {
                await this.teachingFacultyScheduleManager.storeTeachingFacultySchedule(FacultyScheduleData);
              } else {
                console.log("Faculty Schedule has No extracted Data");
              }
            } catch (error) {
              console.log('Error processing the Faculty Schedule file', error.message);
            }
          } else if (category === 'Grades') {
            try {
              const GradesData = await gradesExtractor.processStudentGradesExcel(data.text);
              if (GradesData) {
                await this.gradesManager.storeStudentGrades(gradesData);
              } else {
                console.log("Grades has No extracted Data");
              }
            } catch (error) {
              console.log('Error processing the Grades file', error.message);
            }
          }
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