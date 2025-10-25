class CORScheduleManager {
  constructor(db) {
    this.db = db;
  }
  /**
   * Store COR schedule in department-specific collection
   */
  async storeCORSchedule(corData) {
  try {
    const dept = (corData.metadata.department || 'UNKNOWN').toLowerCase();
    
    // Get the schedules collection for this department
    const collection = this.db.db.collection(`schedules_${dept}`);
    
    const scheduleDoc = {
      // Identification
      schedule_id: `COR_${corData.metadata.department}_${corData.metadata.course}_Y${corData.metadata.year}_${corData.metadata.section}_${Date.now()}`,
      
      // Program Information
      course: corData.metadata.course,
      section: corData.metadata.section,
      year: corData.metadata.year,  // ← CHANGED from year_level
      adviser: corData.metadata.adviser,
      department: corData.metadata.department,
      
      // Schedule Summary
      total_units: corData.metadata.total_units,
      subject_count: corData.metadata.subject_count,
      subject_codes: corData.metadata.subject_codes,
      
      // Detailed Schedule (array of subjects)
      subjects: corData.cor_info.schedule,
      
      // Full formatted text
      formatted_text: corData.formatted_text,
      
      // Metadata
      source_file: corData.metadata.source_file,
      data_type: 'cor_schedule',
      created_at: corData.metadata.created_at,
      updated_at: new Date()
    };

    // Insert the document
    const result = await collection.insertOne(scheduleDoc);

    console.log(`✅ COR schedule stored in: schedules_${dept}`);
    console.log(`   Schedule ID: ${scheduleDoc.schedule_id}`);
    console.log(`   MongoDB _id: ${result.insertedId}`);
    
    return scheduleDoc.schedule_id;

  } catch (error) {
    console.error(`❌ Error storing COR: ${error.message}`);
    return null;
  }
}

  /**
 * Get COR schedules with filters
 */
async getCORSchedules(filters = {}) {
  try {
    const query = { data_type: 'cor_schedule' };
    
    // Build query based on filters
    if (filters.department) {
      query.department = filters.department;
    }
    if (filters.course) {
      query.course = filters.course;
    }
    if (filters.year) {
      query.year = String(filters.year);
    }
    if (filters.section) {
      query.section = filters.section;
    }

    // If department filter is specified, search only that collection
    if (filters.department) {
      const dept = filters.department.toLowerCase();
      const collection = this.db.db.collection(`schedules_${dept}`);
      return await collection.find(query).toArray();
    }

    // Otherwise, search all department collections
    const departments = ['ccs', 'chtm', 'cba', 'cte', 'unknown'];
    const allSchedules = [];

    for (const dept of departments) {
      try {
        const collection = this.db.db.collection(`schedules_${dept}`);
        const schedules = await collection.find(query).toArray();
        allSchedules.push(...schedules);
      } catch {
        // Collection might not exist yet
        continue;
      }
    }

    return allSchedules;
  } catch (error) {
    console.error(`❌ Error getting COR schedules: ${error.message}`);
    return [];
  }
}

  /**
   * Get all COR schedules from all departments
   */
  async getAllCORSchedules() {
    try {
      const departments = ['ccs', 'chtm', 'cba', 'cte', 'unknown'];
      const allSchedules = [];

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`schedules_${dept}`);
          const schedules = await collection.find({ data_type: 'cor_schedule' }).toArray();
          allSchedules.push(...schedules);
        } catch {
          // Collection might not exist yet
          continue;
        }
      }

      return allSchedules;
    } catch (error) {
      console.error(`❌ Error getting all COR schedules: ${error.message}`);
      return [];
    }
  }

  /**
   * Get COR statistics
   */
  async getCORStatistics() {
    try {
      const allSchedules = await this.getAllCORSchedules();
      
      const stats = {
        total_schedules: allSchedules.length,
        by_department: {},
        by_course: {},
        total_subjects: 0,
        total_units: 0
      };

      allSchedules.forEach(schedule => {
        // By department
        const dept = schedule.department || 'UNKNOWN';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // By course
        const course = schedule.course || 'UNKNOWN';
        stats.by_course[course] = (stats.by_course[course] || 0) + 1;

        // Totals
        stats.total_subjects += parseInt(schedule.subject_count) || 0;
        stats.total_units += parseFloat(schedule.total_units) || 0;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting COR statistics: ${error.message}`);
      return null;
    }
  }
}

export default CORScheduleManager;