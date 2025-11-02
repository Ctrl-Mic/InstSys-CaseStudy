import mongoose from 'mongoose';
import crypto from 'crypto';
import { userSchema, fileSchema } from '../components/constructor.js';
import { connect } from 'http2';

const url = "mongodb://localhost:27017/school_system";

export async function connection() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }

    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Database connection successful");
  
    return db = mongoose.connection.db;

  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

const User = mongoose.model('User', userSchema);
const File = mongoose.model('File', fileSchema);

export async function register(userData) {
  try {

    const user = new User(userData);
    const savedUser = await user.save();
    console.log("User registered.");

    return savedUser;

  } catch (error) {

    if (error.code === 11000) {

      console.error(`Registration Error.`);
      return { status: 409, message: "There was an error with your registration" };

    }

    console.error("Error registering user:", error.message);
    return { status: 500, message: "Internal Server Error" };
  } finally {
    
  }
}

export async function upload(userFile) {
  try {

    const fileHash = crypto.createHash('sha256').update(userFile.file).digest('hex');
    const existingfile = await File.findOne({ fileHash });

    if (existingfile) {
      console.error(" Duplicate file content ");
      return { status: 409, message: "Duplicate file content" };
    }

    const file = new File({ ...userFile, fileHash });
    const saveFile = await file.save();
    console.log("File uploaded successfully.");
    console.log(saveFile);
    return saveFile;

  } catch (error) {

    if (error.code === 11000) {

      console.error('Duplicate file')
    }

    console.error("Error uploading file:", error.message);
    return { status: 500, message: "Internal server error" };
  }
}

