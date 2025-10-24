import xlsx from 'xlsx';

class StudentDataExtractor {
  static async processExcel(sheet, db) {
    try {

      const data = xlsx.utils.sheet_to_json(sheet);

      const columnMapping = {
        'student id': 'student_id',
        'id no': 'student_id',
        'id': 'student_id',
        'full name': 'full_name',
        'name': 'full_name',
        'surname': 'surname',
        'first name': 'first_name',
        'year': 'year',
        'course': 'course',
        'section': 'section',
        'contact number': 'contact_number',
        'guardian name': 'guardian_name',
        'guardian contact': 'guardian_contact'
      };

      let processedCount = 0;
      for (const row of data) {
        const studentData = {};

        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        });
        Object.keys(columnMapping).forEach(colHeader => {
          const dataKey = columnMapping[colHeader];
          if (normalizedRow[colHeader] !== undefined && normalizedRow[colHeader] !== null) {
            const rawValue = String(normalizedRow[colHeader]).trim();
            if (rawValue && !['nan', '', 'null'].includes(rawValue.toLowerCase())) {
              studentData[dataKey] = this.cleanValue(rawValue, dataKey);
            }
          }
        });

        if (studentData.course) {
          studentData.department = this.detectDepartment(studentData.course);
        }
        if (!studentData.full_name && studentData.surname && studentData.first_name) {
          studentData.full_name = `${studentData.surname}, ${studentData.first_name}`;
        }

        if (studentData.student_id || studentData.full_name) {
          console.log(`testing the data: ${JSON.stringify(studentData, null, 2)}`);
          const result = await db.createStudentRecord(studentData, 'file_extraction');
          if (result) processedCount++;
        }
      }
      console.log(`📊 Processed ${processedCount} students from Excel`);
      return processedCount > 0;

    } catch (error) {
      console.error(`❌ Error processing Excel: ${error.message}`);
      return false;
    }
  }

  static cleanValue(value, fieldType) {
    if (!value) return null;

    value = value.trim();

    if (fieldType === 'student_id') {
      return value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    } else if (['contact_number', 'guardian_contact'].includes(fieldType)) {
      const cleaned = value.replace(/[^\d+]/g, '');
      return (cleaned.length >= 7 && cleaned.length <= 15) ? cleaned : null;
    } else if (['full_name', 'guardian_name', 'surname', 'first_name'].includes(fieldType)) {
      return value.replace(/[^A-Za-z\s.,-]/g, '').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else if (fieldType === 'year') {
      const yearMatch = value.match(/([1-4])/);
      return yearMatch ? yearMatch[1] : null;
    } else if (['course', 'section'].includes(fieldType)) {
      return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    return value;
  }

  static detectDepartment(courseCode) {
    if (!courseCode) return 'UNKNOWN';

    const courseUpper = String(courseCode).toUpperCase().trim();

    const knownCourses = {
      'CCS': ['BSCS', 'BSIT'],
      'CHTM': ['BSHM', 'BSTM'],
      'CBA': ['BSBA', 'BSOA'],
      'CTE': ['BECED', 'BTLE']
    };

    for (const [dept, courses] of Object.entries(knownCourses)) {
      if (courses.includes(courseUpper)) {
        return dept;
      }
    }

    return 'UNKNOWN';
  }
}

export default StudentDataExtractor;