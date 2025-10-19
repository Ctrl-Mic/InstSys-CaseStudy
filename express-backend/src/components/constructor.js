const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  student_name: { type: String, required: true },
  year: { type: String, required: true },
  course: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
})
const fileSchema = new mongoose.Schema({
  file_name: { type: String, require: true },
  fileType: { type: String, required: true },
  file: { type: Buffer, required: true },
  fileHash: { type: String, required: true, unique: true },
})

const StudentSchema = {
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

export default { userSchema, fileSchema, StudentSchema };