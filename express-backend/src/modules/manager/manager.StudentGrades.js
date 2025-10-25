class StudentGradesManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store student grades (only if student exists)
   */
  async storeStudentGrades(gradesData) {
  try {
    const studentNumber = gradesData.metadata.student_number;
    
    // CRITICAL: Check if student exists first
    const existingStudent = await this.db.getStudentById(studentNumber);
    
    if (!existingStudent) {
      console.log(`❌ Student ${studentNumber} NOT FOUND in database`);
      console.log(`   ⚠️  Student must be imported first before adding grades`);
      return { success: false, reason: 'student_not_found' };
    }

    console.log(`✅ Student ${studentNumber} exists: ${existingStudent.full_name}`);

    // Store grades in the student's department collection
    const dept = (existingStudent.department || 'UNKNOWN').toLowerCase();
    const collection = this.db.db.collection(`grades_${dept}`);

    const gradesDoc = {
      student_id: studentNumber,
      student_name: gradesData.metadata.student_name,
      full_name: existingStudent.full_name,
      course: gradesData.metadata.course || existingStudent.course,
      department: existingStudent.department,
      year: existingStudent.year,  // ← CHANGED from year_level
      section: existingStudent.section,
      
      // Grades data
      gwa: gradesData.metadata.gwa,
      total_subjects: gradesData.metadata.total_subjects,
      grades: gradesData.grades_info.grades,
      
      // Metadata
      source_file: gradesData.metadata.source_file,
      data_type: 'student_grades',
      created_at: gradesData.metadata.created_at,
      updated_at: new Date()
    };

    // Check if grades already exist for this student
    const existing = await collection.findOne({ student_id: studentNumber });
    
    if (existing) {
      // Update existing grades
      await collection.updateOne(
        { student_id: studentNumber },
        { $set: gradesDoc }
      );
      console.log(`✅ Updated grades for ${studentNumber} in grades_${dept}`);
    } else {
      // Insert new grades
      await collection.insertOne(gradesDoc);
      console.log(`✅ Stored grades for ${studentNumber} in grades_${dept}`);
    }

    return { success: true, department: dept };

  } catch (error) {
    console.error(`❌ Error storing grades: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

  /**
   * Get student grades
   */
  async getStudentGrades(studentId, department = null) {
    try {
      if (department) {
        const collection = this.db.db.collection(`grades_${department.toLowerCase()}`);
        return await collection.findOne({ student_id: studentId });
      }

      // Search all department collections
      const departments = ['ccs', 'chtm', 'cba', 'cte', 'unknown'];
      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`grades_${dept}`);
          const grades = await collection.findOne({ student_id: studentId });
          if (grades) return grades;
        } catch {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Error getting grades: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all grades
   */
  async clearAllGrades() {
    try {
      const departments = ['ccs', 'chtm', 'cba', 'cte', 'unknown'];
      let totalCleared = 0;

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`grades_${dept}`);
          const result = await collection.deleteMany({ data_type: 'student_grades' });
          
          if (result.deletedCount > 0) {
            console.log(`   Cleared ${result.deletedCount} grade record(s) from grades_${dept}`);
            totalCleared += result.deletedCount;
          }
        } catch {
          continue;
        }
      }

      if (totalCleared > 0) {
        console.log(`✅ Total grade records cleared: ${totalCleared}`);
      }
    } catch (error) {
      console.error(`❌ Error clearing grades: ${error.message}`);
    }
  }
}

export default StudentGradesManager;