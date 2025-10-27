import StudentDataExtractor from '../modules/extractor/extractor.StudentData.js';
import NonTeachingFacultyExtractor from '../modules/extractor/extractor.NonTeachingFaculty.js';
import NonTeachingFacultyManager from '../modules/manager/manager.NonTeachingFaculty.js'
import TeachingFacultyExtractor from '../modules/extractor/extractor.TeachingFaculty.js';
import TeachingFacultyManager from '../modules/manager/manager.TeachingFacultyManager.js';
import CORExcelExtractor from '../modules/extractor/extractor.COR.js';
import CORScheduleManager from '../modules/manager/manager.CORScheduleManager.js';
import TeachingFacultyScheduleExtractor from '../modules/extractor/extractor.TeachingFacultySchedule.js';
import StudentGradesExtractor from '../modules/extractor/extractor.GRADES.js';
import StudentGradesManager from '../modules/manager/manager.StudentGrades.js';
import AdminExtractor from '../modules/extractor/extractor.Admin.js';
import AdminManager from '../modules/manager/manager.Admin.js';
import CurriculumExtractor from '../modules/extractor/extractor.Curriculum.js';
import CurriculumManager from '../modules/manager/manager.Curriculum.js';
import GeneralInfoExtractor from '../modules/extractor/extractor.GeneralInfo.js';
import GeneralInfoManager from '../modules/manager/manager.GeneralInfo.js';
import TeachingFacultyScheduleManager from '../modules//manager/manager.TeachingFacultySchedule.js';
import StudentDatabase from '../modules/modules.StudentDatabase.js';

const client = new StudentDatabase(null);
await client.connect()
const __NonTeachingFacultyExtractor = new NonTeachingFacultyExtractor();
const __NonTeachingManager = new NonTeachingFacultyManager(client.db);
const __TeachingFacultyExtractor = new TeachingFacultyExtractor();
const __TeachingFacultyManager = new TeachingFacultyManager(client.db);
const __CORExcelExtractor = new CORExcelExtractor();
const __CORScheduleManager = new CORScheduleManager(client.db);
const __FacultySchedule = new TeachingFacultyScheduleExtractor();
const __FacultyScheduleManager = new TeachingFacultyScheduleManager(client);
const __GradesExtractor = new StudentGradesExtractor();
const __GradesManager = new StudentGradesManager(client);
const __AdminExtractor = new AdminExtractor();
const __AdminManager = new AdminManager(client);
const __CurriculumExtractor = new CurriculumExtractor();
const __CurriculumManager = new CurriculumManager(client);
const __GeneralInfoExtractor = new GeneralInfoExtractor();
const __GeneralInfoManager = new GeneralInfoManager(client);

const processors = {
  students_data: {
    extract: (data, db) => StudentDataExtractor.processExcel(data.text, db),
    store: async (result, db) => {
      try {
        await db.createStudentRecord(result);
      } catch (error) {
        console.log("Failed to reccord Data");
      }
    },
    errorMsg: "Student Data",
  },
  non_teaching_faculty: {
    extract: (data, db) => __NonTeachingFacultyExtractor.processNonTeachingFacultyExcel(data.text, db),
    store: (result, db) => __NonTeachingManager.storeNonTeachingFaculty(result),
    errorMsg: "Non Teaching Faculty",
  },
  teaching_faculty: {
    extract: (data, db) => __TeachingFacultyExtractor.processTeachingFacultyExcel(data.text, db),
    store: (result, db) => __TeachingFacultyManager.storeTeachingFaculty(result),
    errorMsg: "Teaching Faculty",
  },
  cor: {
    extract: (data, db) => __CORExcelExtractor.processCORExcel(data.text, db),
    store: (result, db) => __CORScheduleManager.storeCORSchedule(result),
    errorMsg: "COR Schedule",
  },
  faculty_schedule: {
    extract: (data, db) => __FacultySchedule.processTeachingFacultyScheduleExcel(data.text),
    store: (result, db) => __FacultyScheduleManager.storeTeachingFacultySchedule(result),
    errorMsg: "Faculty Schedule",
  },
  grades: {
    extract: (data, db) => __GradesExtractor.processStudentGradesExcel(data.text),
    store: (result, db) => __GradesManager.storeStudentGrades(result),
    errorMsg: "Grades",
  },
  admin: {
    extract: (data, db) => __AdminExtractor.processAdminExcel(data.text),
    store: (result, db) => __AdminManager.storeAdmin(result),
    errorMsg: "Admin",
  },
  curriculum: {
    extract: (data, db) => __CurriculumExtractor.processCurriculumExcel(data.text),
    store: (result, db) => __CurriculumManager.storeCurriculum(result),
    errorMsg: "Curriculumn",
  },
  generalinfo: {
    extract: (data, db) => __GeneralInfoExtractor.processGeneralInfoPDF(data.text),
    store: (result, db) => __GeneralInfoManager.storeGeneralInfo(data.text),
    errorMsg: "General Info"
  }
};

export async function closeConnection() {
  try {
    await client.close();
    console.log('🔒 MongoDB connection closed successfully');
  } catch (err) {
    console.error('❌ Error closing MongoDB connection:', err.message);
  }
}

export default processors;