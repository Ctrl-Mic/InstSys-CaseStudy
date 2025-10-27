class NonTeachingScheduleManager {
  constructor(db) {
    this.db = db;
  }

  async storeNonTeachingSchedule(scheduleData) {
    try {
      const dept = (scheduleData.metadata.department || 'UNKNOWN').toLowerCase();
      const collection = this.db.db.collection(`non_teaching_schedule_${dept}`);

      const scheduleDoc = {
        schedule_id: `SCHEDULE_NT_${scheduleData.metadata.staff_name.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
        staff_name: scheduleData.metadata.staff_name,
        full_name: scheduleData.metadata.full_name,
        department: scheduleData.metadata.department,
        position: scheduleData.metadata.position || 'Staff',
        total_shifts: scheduleData.metadata.total_shifts,
        days_working: scheduleData.metadata.days_working,
        schedule: scheduleData.schedule_data.schedule,
        schedule_by_day: scheduleData.schedule_data.by_day,
        formatted_text: scheduleData.formatted_text,
        source_file: scheduleData.metadata.source_file,
        data_type: 'non_teaching_faculty_schedule',
        faculty_type: 'non_teaching_schedule',
        created_at: scheduleData.metadata.created_at,
        updated_at: new Date()
      };

      const result = await collection.insertOne(scheduleDoc);
      console.log(`✅ Non-teaching schedule stored in: non_teaching_schedule_${dept}`);
      console.log(`   Schedule ID: ${scheduleDoc.schedule_id}`);
      console.log(`   Staff: ${scheduleDoc.staff_name}`);
      console.log(`   MongoDB _id: ${result.insertedId}`);

      return scheduleDoc.schedule_id;
    } catch (error) {
      console.error(`❌ Error storing non-teaching schedule: ${error.message}`);
      return null;
    }
  }

  async getAllNonTeachingSchedules() {
    try {
      const departments = ['ccs', 'chtm', 'cba', 'cte', 'coe', 'con', 'cas', 'admin', 'registrar', 'library', 'finance', 'hr', 'unknown'];
      const allSchedules = [];
      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`non_teaching_schedule_${dept}`);
          const schedules = await collection.find({ data_type: 'non_teaching_faculty_schedule' }).toArray();
          allSchedules.push(...schedules);
        } catch { continue; }
      }
      return allSchedules;
    } catch (error) {
      console.error(`❌ Error getting all non-teaching schedules: ${error.message}`);
      return [];
    }
  }

  async getNonTeachingSchedulesByDepartment(department) {
    try {
      const dept = department.toLowerCase();
      const collection = this.db.db.collection(`non_teaching_schedule_${dept}`);
      return await collection.find({ data_type: 'non_teaching_faculty_schedule' }).toArray();
    } catch (error) {
      console.error(`❌ Error getting non-teaching schedules: ${error.message}`);
      return [];
    }
  }

  async getNonTeachingScheduleByStaff(staffName) {
    try {
      const allSchedules = await this.getAllNonTeachingSchedules();
      return allSchedules.filter(schedule =>
        schedule.staff_name.toLowerCase().includes(staffName.toLowerCase())
      );
    } catch (error) {
      console.error(`❌ Error getting schedule by staff: ${error.message}`);
      return [];
    }
  }

  async getNonTeachingScheduleStatistics() {
    try {
      const allSchedules = await this.getAllNonTeachingSchedules();
      const stats = {
        total_schedules: allSchedules.length,
        by_department: {},
        total_shifts_all: 0,
        total_staff: allSchedules.length,
        by_day: {}
      };
      allSchedules.forEach(schedule => {
        const dept = schedule.department || 'UNKNOWN';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;
        stats.total_shifts_all += schedule.total_shifts || 0;
        if (schedule.schedule_by_day) {
          Object.keys(schedule.schedule_by_day).forEach(day => {
            stats.by_day[day] = (stats.by_day[day] || 0) + 1;
          });
        }
      });
      return stats;
    } catch (error) {
      console.error(`❌ Error getting non-teaching schedule statistics: ${error.message}`);
      return null;
    }
  }

  async clearAllNonTeachingSchedules() {
    try {
      console.log('🔍 Searching for non-teaching schedule collections...');

      // Get the actual MongoDB database object
      const database = this.db.db || this.db.client.db();

      // Get ALL collections in the database
      const collections = await database.listCollections().toArray();

      let totalCleared = 0;
      let collectionsFound = 0;

      // Find and clear all collections that start with 'non_teaching_schedule_'
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;

        // Check if this is a non-teaching schedule collection
        if (collectionName.startsWith('non_teaching_schedule_')) {
          collectionsFound++;
          console.log(`   🔍 Found collection: ${collectionName}`);

          try {
            const collection = database.collection(collectionName);

            // Count documents first
            const count = await collection.countDocuments();
            console.log(`      Documents in collection: ${count}`);

            if (count > 0) {
              // Delete all documents
              const result = await collection.deleteMany({});

              console.log(`   ✅ Cleared ${result.deletedCount} schedule(s) from ${collectionName}`);
              totalCleared += result.deletedCount;
            } else {
              console.log(`   ℹ️  ${collectionName} is already empty`);
            }

          } catch (error) {
            console.error(`   ⚠️  Error clearing ${collectionName}: ${error.message}`);
            continue;
          }
        }
      }

      if (collectionsFound === 0) {
        console.log('ℹ️  No non-teaching schedule collections found in database');
      } else if (totalCleared > 0) {
        console.log(`✅ Total non-teaching schedules cleared: ${totalCleared} from ${collectionsFound} collection(s)`);
      } else {
        console.log(`ℹ️  Found ${collectionsFound} collection(s) but they were already empty`);
      }

    } catch (error) {
      console.error(`❌ Error clearing non-teaching schedules: ${error.message}`);
      console.error(error.stack);
    }
  }
}

export default NonTeachingScheduleManager;