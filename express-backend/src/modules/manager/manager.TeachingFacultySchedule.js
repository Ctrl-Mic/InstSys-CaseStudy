export class TeachingFacultyScheduleManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store teaching faculty schedule in department-specific collection
   */
  async storeTeachingFacultySchedule(scheduleData) {
    try {
      const dept = (scheduleData.metadata.department || 'UNKNOWN').toLowerCase();
      
      // Get the faculty schedule collection for this department
      const collection = this.db.db.collection(`faculty_schedules_${dept}`);
      
      const scheduleDoc = {
        // Identification
        schedule_id: `FACULTY_SCHED_${scheduleData.metadata.department}_${Date.now()}`,
        adviser_name: scheduleData.metadata.adviser_name,
        full_name: scheduleData.metadata.full_name,
        department: scheduleData.metadata.department,
        
        // Schedule Summary
        total_subjects: scheduleData.metadata.total_subjects,
        days_teaching: scheduleData.metadata.days_teaching,
        
        // Detailed Schedule (array of classes)
        schedule: scheduleData.schedule_info.schedule,
        
        // Full formatted text
        formatted_text: scheduleData.formatted_text,
        
        // Metadata
        source_file: scheduleData.metadata.source_file,
        data_type: 'teaching_faculty_schedule',
        faculty_type: 'schedule',
        created_at: scheduleData.metadata.created_at,
        updated_at: new Date()
      };
      
      // Insert the document
      const result = await collection.insertOne(scheduleDoc);
      
      console.log(`✅ Teaching faculty schedule stored in: faculty_schedules_${dept}`);
      console.log(`   Schedule ID: ${scheduleDoc.schedule_id}`);
      console.log(`   MongoDB _id: ${result.insertedId}`);
      
      return scheduleDoc.schedule_id;
      
    } catch (error) {
      console.error(`❌ Error storing teaching faculty schedule: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all teaching faculty schedules from all departments
   */
  async getAllTeachingFacultySchedules() {
    try {
      const departments = ['cas', 'ccs', 'chtm', 'cba', 'cte', 'coe', 'con', 'admin', 'unknown'];
      const allSchedules = [];

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`faculty_schedules_${dept}`);
          const schedules = await collection.find({ data_type: 'teaching_faculty_schedule' }).toArray();
          allSchedules.push(...schedules);
        } catch {
          // Collection might not exist yet
          continue;
        }
      }

      return allSchedules;
    } catch (error) {
      console.error(`❌ Error getting all teaching faculty schedules: ${error.message}`);
      return [];
    }
  }

  /**
   * Get teaching faculty schedules by department
   */
  async getTeachingFacultySchedulesByDepartment(department) {
    try {
      const dept = department.toLowerCase();
      const collection = this.db.db.collection(`faculty_schedules_${dept}`);
      return await collection.find({ data_type: 'teaching_faculty_schedule' }).toArray();
    } catch (error) {
      console.error(`❌ Error getting teaching faculty schedules: ${error.message}`);
      return [];
    }
  }

  /**
   * Get teaching faculty schedule statistics
   */
  async getTeachingFacultyScheduleStatistics() {
    try {
      const allSchedules = await this.getAllTeachingFacultySchedules();
      
      const stats = {
        total_schedules: allSchedules.length,
        total_faculty: allSchedules.length,
        total_classes: 0,
        by_department: {},
        by_days_teaching: {}
      };

      allSchedules.forEach(schedule => {
        // By department
        const dept = schedule.department || 'UNKNOWN';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // Total classes
        stats.total_classes += schedule.total_subjects || 0;

        // By days teaching
        const days = schedule.days_teaching || 0;
        stats.by_days_teaching[days] = (stats.by_days_teaching[days] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting teaching faculty schedule statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all teaching faculty schedules
   */
  async clearAllTeachingFacultySchedules() {
    try {
      // Get ALL collections in the database
      const collections = await this.db.db.listCollections().toArray();
      
      let totalCleared = 0;

      // Find all collections that start with 'faculty_schedules_'
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        
        // Check if this is a faculty schedule collection
        if (collectionName.startsWith('faculty_schedules_')) {
          try {
            const collection = this.db.db.collection(collectionName);
            const result = await collection.deleteMany({ data_type: 'teaching_faculty_schedule' });
            
            if (result.deletedCount > 0) {
              console.log(`   Cleared ${result.deletedCount} faculty schedule(s) from ${collectionName}`);
              totalCleared += result.deletedCount;
            }
          } catch (error) {
            console.error(`   ⚠️  Error clearing ${collectionName}: ${error.message}`);
            continue;
          }
        }
      }

      if (totalCleared > 0) {
        console.log(`✅ Total teaching faculty schedules cleared: ${totalCleared}`);
      } else {
        console.log('ℹ️  No teaching faculty schedules to clear');
      }
    } catch (error) {
      console.error(`❌ Error clearing teaching faculty schedules: ${error.message}`);
    }
  }
}
