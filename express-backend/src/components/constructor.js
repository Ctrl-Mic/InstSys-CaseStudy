import path from "path";
import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  student_name: { type: String, required: true },
  year: { type: String, required: true },
  course: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
})

export const fileSchema = new mongoose.Schema({
  file_name: { type: String, require: true },
  fileType: { type: String, required: true },
  file: { type: Buffer, required: true },
  fileHash: { type: String, required: true, unique: true },
  file_format: { type: String, require: true },
})

export const StudentSchema = {
  student_id: { type: String, require: true },
  surname: { type: String, require: true },
  first_name: { type: String, require: true },
  course: { type: String, require: true },
  section: { type: String, require: true },
  year: { type: String, require: true },
  contact_number: { type: String, require: true },
  guardian_name: { type: String, require: true },
  guardian_contact: { type: String, require: true },
}

export async function __defaultText(corInfo) {

  return `
  COR (Certificate of Registration) - Class Schedule
  PROGRAM INFORMATION:
  Program: ${corInfo.program_info.Program}
  Year Level: ${corInfo.program_info['Year Level']}
  Section: ${corInfo.program_info.Section}
  Adviser: ${corInfo.program_info.Adviser}
  Total Units: ${corInfo.total_units || 'N/A'}

  ENROLLED SUBJECTS (${corInfo.schedule.length} subjects):
  `;

}

export async function __text(course) {

  return `Subject ${i + 1}:
  - Subject Code: ${course['Subject Code'] || 'N/A'}
  - Description: ${course['Description'] || 'N/A'}
  - Type: ${course['Type'] || 'N/A'}
  - Units: ${course['Units'] || 'N/A'}
  - Schedule: ${course['Day'] || 'N/A'} ${course['Time Start'] || 'N/A'}-${course['Time End'] || 'N/A'}
  - Room: ${course['Room'] || 'N/A'}
  `;
  
}

export async function CORmetadataSchema(corInfo, filename) {
  return {
    course: corInfo.program_info.Program,
    section: corInfo.program_info.Section,
    year: corInfo.program_info['Year Level'],  // ← CHANGED from year_level
    adviser: corInfo.program_info.Adviser,
    data_type: 'cor_schedule',
    subject_codes: subjectCodesString,
    total_units: String(corInfo.total_units || ''),
    subject_count: corInfo.schedule.length,
    department: this.detectDepartmentFromCourse(corInfo.program_info.Program),
    created_at: new Date(),
    source_file: path.basename(filename)
  };
}

export async function GRADEmetadataSchema(gradesInfo, filename) {
  return {
    student_number: gradesInfo.student_info.student_number,
    student_name: gradesInfo.student_info.student_name,
    course: gradesInfo.student_info.course,
    gwa: gradesInfo.student_info.gwa,
    total_subjects: gradesInfo.grades.length,
    data_type: 'student_grades',
    source_file: path.basename(filename),
    created_at: new Date()
  };
}