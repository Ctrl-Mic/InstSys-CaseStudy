import xlsx from 'xlsx';
import path from 'path';
import { __validGradeStatuses, __gradesIndicators, __fieldMappings } from '../../components/mapper.js'
import { logMessage } from '../../utils/console.js';
import { GRADEmetadataSchema } from '../../components/constructor.js';

class StudentGradesExtractor {
  constructor(log = false) {
    this.validGradeStatuses = __validGradeStatuses;
    this.log = log;
  }

  async extractStudentGradesExcelInfo(sheet, db) {
    try {

      const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const studentInfo = this.extractGradesStudentMetadata(data, filename);
      const gradesData = this.extractGradesRecords(data);

      return { student_info: studentInfo, grades: gradesData };

    } catch (error) {
      logMessage(`❌ Error in student grades extraction: ${error.message}`, this.log);
      return null;
    }
  }

  //Check if Excel file is a student grades file
  isStudentGradesExcel(data) {
    try {
      let firstRowsText = '';

      for (let i = 0; i < Math.min(20, data.length); i++) {
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j]) {
            firstRowsText += String(data[i][j]).toUpperCase() + ' ';
          }
        }
      }

      const gradesIndicators = __gradesIndicators;

      const facultyIndicators = ['FACULTY', 'PROFESSOR', 'INSTRUCTOR', 'SCHEDULE', 'TIME', 'ROOM'];
      const curriculumIndicators = ['CURRICULUM', 'COURSE CURRICULUM', 'SYLLABUS'];

      const gradesIndicatorCount = gradesIndicators.filter(ind => firstRowsText.includes(ind)).length;
      const hasFacultyIndicator = facultyIndicators.some(ind => firstRowsText.includes(ind));
      const hasCurriculumIndicator = curriculumIndicators.some(ind => firstRowsText.includes(ind));

      const isGrades = gradesIndicatorCount >= 4 && !hasFacultyIndicator && !hasCurriculumIndicator;

      return isGrades;

    } catch (error) {
      logMessage(`🔍 Error in grades detection: ${error.message}`, this.log);
      return false;
    }
  }

  extractGradesStudentMetadata(data, filename) {
    const studentInfo = {
      student_number: '',
      student_name: '',
      course: '',
      gwa: ''
    };

    // Search first 20 rows
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i] || [];

      for (let j = 0; j < Math.min(row.length, 10); j++) {
        if (!row[j]) continue;

        const cellValue = String(row[j]).trim();
        const cellUpper = cellValue.toUpperCase();

        // Look for student number/ID
        if (['STUDENT NUMBER:', 'STUDENT ID:', 'ID NUMBER:'].some(kw => cellUpper.includes(kw))) {
          let idValue = null;

          // Check right cell
          if (j + 1 < row.length && row[j + 1]) {
            const potentialId = String(row[j + 1]).trim();
            if (potentialId.length > 2) idValue = potentialId;
          }

          // Check if current cell contains ID after colon
          if (!idValue && cellValue.includes(':')) {
            const parts = cellValue.split(':', 2);
            if (parts[1] && parts[1].trim().length > 2) {
              idValue = parts[1].trim();
            }
          }

          if (idValue) {
            studentInfo.student_number = idValue.toUpperCase();
            logMessage(`🎯 Found student number: ${idValue}`, this.log);
          }
        }

        // Look for student name
        if (['STUDENT NAME:', 'NAME:', 'FULL NAME:'].some(kw => cellUpper.includes(kw))) {
          let nameValue = null;

          // Check right cell
          if (j + 1 < row.length && row[j + 1]) {
            const potentialName = String(row[j + 1]).trim();
            if (potentialName.length > 2) nameValue = potentialName;
          }

          // Check if current cell contains name after colon
          if (!nameValue && cellValue.includes(':')) {
            const parts = cellValue.split(':', 2);
            if (parts[1] && parts[1].trim().length > 2) {
              nameValue = parts[1].trim();
            }
          }

          if (nameValue) {
            studentInfo.student_name = this.titleCase(nameValue);
            logMessage(`🎯 Found student name: ${nameValue}`, this.log);
          }
        }

        // Look for course
        if (['COURSE:', 'PROGRAM:', 'DEGREE:'].some(kw => cellUpper.includes(kw))) {
          let courseValue = null;

          // Check right cell
          if (j + 1 < row.length && row[j + 1]) {
            const potentialCourse = String(row[j + 1]).trim();
            if (potentialCourse.length > 1) courseValue = potentialCourse;
          }

          // Check if current cell contains course after colon
          if (!courseValue && cellValue.includes(':')) {
            const parts = cellValue.split(':', 2);
            if (parts[1] && parts[1].trim().length > 1) {
              courseValue = parts[1].trim();
            }
          }

          if (courseValue) {
            const courseMatch = courseValue.match(/\b(BS[A-Z]{2,4}|AB[A-Z]{2,4})\b/i);
            studentInfo.course = courseMatch ? courseMatch[1].toUpperCase() : courseValue.toUpperCase();
            console.log(`🎯 Found course: ${courseValue}`);
          }
        }

        // Look for GWA
        if (['GWA:', 'GENERAL WEIGHTED AVERAGE:', 'AVERAGE:'].some(kw => cellUpper.includes(kw))) {
          let gwaValue = null;

          // Check right cell
          if (j + 1 < row.length && row[j + 1]) {
            const potentialGwa = String(row[j + 1]).trim();
            if (this.isValidGrade(potentialGwa)) gwaValue = potentialGwa;
          }

          // Check if current cell contains GWA after colon
          if (!gwaValue && cellValue.includes(':')) {
            const parts = cellValue.split(':', 2);
            if (parts[1]) {
              const potentialGwa = parts[1].trim();
              if (this.isValidGrade(potentialGwa)) gwaValue = potentialGwa;
            }
          }

          if (gwaValue) {
            studentInfo.gwa = gwaValue;
            logMessage(`🎯 Found GWA: ${gwaValue}`, this.log);
          }
        }
      }
    }

    // Fallback: infer course from filename
    if (!studentInfo.course) {
      const filenameCourse = this.extractCourseFromFilename(filename);
      if (filenameCourse) {
        studentInfo.course = filenameCourse;
        logMessage(`🎯 Inferred course from filename: ${filenameCourse}`, this.log);
      }
    }

    return studentInfo;
  }

  //Extract individual grade records
  extractGradesRecords(data) {
    const gradesData = [];
    let headerRow = -1;
    const columnMapping = {};

    const fieldMappings = __fieldMappings

    // Find header row
    for (let i = 0; i < Math.min(15, data.length); i++) {
      const rowText = data[i].slice(0, 15)
        .filter(cell => cell)
        .map(cell => String(cell).toUpperCase())
        .join(' ');

      let headerCount = 0;
      for (const [field, possibleHeaders] of Object.entries(fieldMappings)) {
        if (possibleHeaders.some(header => rowText.includes(header))) {
          headerCount++;
        }
      }

      if (headerCount >= 3) {
        headerRow = i;
        logMessage(`🎯 Found grades header at row ${i}`, this.log);
        break;
      }
    }

    if (headerRow === -1) {
      logMessage('⚠️ Could not find grades header row', this.log);
      return [];
    }

    // Map columns
    const headerCells = [];
    for (let j = 0; j < data[headerRow].length; j++) {
      const headerText = data[headerRow][j] ? String(data[headerRow][j]).trim().toUpperCase() : '';
      headerCells.push([j, headerText]);
    }

    // Map fields to columns
    for (const [field, possibleHeaders] of Object.entries(fieldMappings)) {
      let bestMatch = null;
      let bestScore = 0;

      for (const [colIdx, headerText] of headerCells) {
        for (const possibleHeader of possibleHeaders) {
          if (headerText.includes(possibleHeader)) {
            const score = headerText === possibleHeader ? possibleHeader.length : possibleHeader.length - 1;
            if (score > bestScore) {
              bestScore = score;
              bestMatch = colIdx;
            }
          }
        }
      }

      if (bestMatch !== null) {
        columnMapping[field] = bestMatch;
        logMessage(`🎯 Mapped ${field} to column ${bestMatch}`, this.log);
      }
    }

    console.log('📋 Final column mapping:', columnMapping);

    // Extract grade records
    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i] || [];

      // Skip empty rows
      if (row.every(cell => !cell)) continue;

      // Skip footer rows
      const firstCell = row[0] ? String(row[0]).toUpperCase() : '';
      if (['TOTAL', 'GWA', 'AVERAGE', 'SUMMARY'].some(kw => firstCell.includes(kw))) {
        break;
      }

      // Extract grade data
      const gradeEntry = {};
      let validEntry = false;

      for (const [field, colIdx] of Object.entries(columnMapping)) {
        if (colIdx < row.length && row[colIdx]) {
          const value = String(row[colIdx]).trim();
          if (value && !['N/A', 'NONE', 'TBA', 'TBD'].includes(value.toUpperCase())) {
            const cleanedValue = this.cleanGradesValue(value, field);
            if (cleanedValue) {
              gradeEntry[field] = cleanedValue;
              if (['subject_code', 'subject_description'].includes(field)) {
                validEntry = true;
              }
            }
          }
        }
      }

      // Set defaults for missing fields
      for (const field of Object.keys(fieldMappings)) {
        if (!gradeEntry[field]) {
          gradeEntry[field] = this.getDefaultGradesValue(field);
        }
      }

      // Only add if valid
      if (validEntry && (gradeEntry.subject_code || gradeEntry.subject_description)) {
        gradesData.push(gradeEntry);
        logMessage(`📚 Added grade: ${gradeEntry.subject_code} - ${gradeEntry.equivalent}`, this.log);
      }
    }

    return gradesData;
  }

  //Helper functions
  isValidGrade(gradeStr) {
    try {
      const gradeFloat = parseFloat(gradeStr);
      return gradeFloat >= 1.0 && gradeFloat <= 5.0;
    } catch {
      const gradeUpper = String(gradeStr).toUpperCase().trim();
      const validGrades = ['A', 'B', 'C', 'D', 'F', 'P', 'INC', 'DRP', 'PASSED', 'FAILED'];
      return validGrades.some(valid => gradeUpper.includes(valid));
    }
  }

  extractCourseFromFilename(filename) {
    const filenameUpper = path.basename(filename).toUpperCase();
    const patterns = [
      /\b(BSCS|BSIT|BSHM|BSTM|BSOA|BECED|BTLE)\b/,
      /BS([A-Z]{2,4})/,
      /AB([A-Z]{2,4})/
    ];

    for (const pattern of patterns) {
      const match = filenameUpper.match(pattern);
      if (match) {
        return match[0].startsWith('BS') || match[0].startsWith('AB')
          ? match[0]
          : `BS${match[1]}`;
      }
    }
    return null;
  }

  cleanGradesValue(value, fieldType) {
    if (!value || !value.trim()) return null;

    value = value.trim();

    if (fieldType === 'subject_code') {
      const cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      return cleaned.length >= 2 ? cleaned : null;
    } else if (fieldType === 'subject_description') {
      if (value.length > 1 && !['N/A', 'NONE', 'TBA', 'TBD'].includes(value.toUpperCase())) {
        return this.titleCase(value);
      }
      return null;
    } else if (fieldType === 'units') {
      const numericMatch = value.match(/(\d+(?:\.\d+)?)/);
      return numericMatch ? numericMatch[1] : '3';
    } else if (fieldType === 'equivalent') {
      return this.isValidGrade(value) ? value : null;
    } else if (fieldType === 'remarks') {
      const cleaned = value.toUpperCase().trim();
      for (const remark of this.validGradeStatuses) {
        if (cleaned.includes(remark)) return remark;
      }
      return cleaned.length > 0 ? cleaned : 'PASSED';
    }

    return value;
  }

  getDefaultGradesValue(field) {
    const defaults = {
      subject_code: 'N/A',
      subject_description: 'Unknown Subject',
      units: '3',
      equivalent: 'N/A',
      remarks: 'N/A'
    };
    return defaults[field] || 'N/A';
  }

  titleCase(str) {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  //Process student grades Excel and return structured data
  async processStudentGradesExcel(data) {
    try {
      const gradesInfo = await this.extractStudentGradesExcelInfo(data);

      if (!gradesInfo || !gradesInfo.student_info.student_number) {
        logMessage('❌ Could not extract student grades data', this.log);
        return null;
      }

      const metadata = GRADEmetadataSchema(gradesInfo, filename);

      return {
        grades_info: gradesInfo,
        metadata: metadata
      };

    } catch (error) {
      console.error(`❌ Error processing student grades: ${error.message}`);
      return null;
    }
  }
}

export default StudentGradesExtractor;
