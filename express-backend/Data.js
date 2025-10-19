import  { StudentDatabase, StudentDataExtractor } from './utils/main.js';
import retrieve_file from './src/modules/requestFile.js';
import StudentSchema from './src/components/constructor.js';

class Connector {
  constructor(connectionString = null) {
    this.db = new StudentDatabase(connectionString);
  }

  async DataTransfer() {
    try {
      

      const fileData = await retrieve_file('missio&vision.pdf');
      console.log(fileData);
      // await scanAndProcessFiles(response);

    } catch (error) {

    }
    
  }

  async clearAllData() {
    try {
      await this.db.clearAllData();

    } catch (error) {
      console.error(`Error clearing data: ${error.message}`);
    }
  }

  async scanAndProcessFiles() {
      try {

        try {
          await fs.access(this.studentExcelFolder);
        } catch {
          console.log(`📁 Creating folder: ${this.studentExcelFolder}`);
          await fs.mkdir(this.studentExcelFolder, { recursive: true });
          console.log(`ℹ️  Place your Excel files in: ${this.studentExcelFolder}`);
          return false;
        }
  
        const files = await fs.readdir(this.studentExcelFolder);
        const excelFiles = files.filter(file => 
          file.endsWith('.xlsx') || file.endsWith('.xls')
        );
  
        if (excelFiles.length === 0) {
          console.log(`⚠️  No Excel files found in: ${this.studentExcelFolder}`);
          console.log(`ℹ️  Place your Excel files there and run again`);
          return false;
        }
  
        console.log(`\n📊 Found ${excelFiles.length} Excel file(s)`);
        let totalProcessed = 0;
  
        for (const excelFile of excelFiles) {
          const filePath = path.join(this.studentExcelFolder, excelFile);
          console.log(`\n📄 Processing: ${excelFile}`);
          
          try {
            const success = await StudentDataExtractor.processExcel(filePath, this.db);
            
          } catch (error) {
            console.error(`❌ Error processing ${excelFile}: ${error.message}`);
          }
        }
  
        return totalProcessed > 0;
  
      } catch (error) {
        console.error(`❌ Error scanning files: ${error.message}`);
        return false;
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


