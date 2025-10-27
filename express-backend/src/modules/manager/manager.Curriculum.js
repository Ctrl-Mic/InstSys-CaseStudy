class CurriculumManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store curriculum in department-specific collection
   */
  async storeCurriculum(curriculumData) {
    try {
      const dept = (curriculumData.metadata.department || 'UNKNOWN').toLowerCase();

      // Get the curriculum collection for this department
      const collection = this.db.db.collection(`curriculum_${dept}`);

      const curriculumDoc = {
        // Identification
        curriculum_id: `CURRICULUM_${curriculumData.metadata.department}_${curriculumData.metadata.course}_${curriculumData.metadata.effective_year || Date.now()}`,
        program: curriculumData.metadata.program,
        course: curriculumData.metadata.course,
        department: curriculumData.metadata.department,

        // Curriculum Info
        effective_year: curriculumData.metadata.effective_year,
        curriculum_year: curriculumData.metadata.curriculum_year,
        revision: curriculumData.metadata.revision,
        total_subjects: curriculumData.metadata.total_subjects,

        // Full curriculum structure (organized by year and semester)
        curriculum: curriculumData.curriculum_data.curriculum,

        // Full formatted text
        formatted_text: curriculumData.formatted_text,

        // Metadata
        source_file: curriculumData.metadata.source_file,
        data_type: 'curriculum',
        created_at: curriculumData.metadata.created_at,
        updated_at: new Date()
      };

      // Insert the document
      const result = await collection.insertOne(curriculumDoc);

      console.log(`✅ Curriculum stored in: curriculum_${dept}`);
      console.log(`   Curriculum ID: ${curriculumDoc.curriculum_id}`);
      console.log(`   MongoDB _id: ${result.insertedId}`);

      return curriculumDoc.curriculum_id;

    } catch (error) {
      console.error(`❌ Error storing curriculum: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all curricula from all departments
   */
  async getAllCurricula() {
    try {
      const departments = ['cas', 'ccs', 'chtm', 'cba', 'cte', 'coe', 'con', 'unknown'];
      const allCurricula = [];

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`curriculum_${dept}`);
          const curricula = await collection.find({ data_type: 'curriculum' }).toArray();
          allCurricula.push(...curricula);
        } catch {
          // Collection might not exist yet
          continue;
        }
      }

      return allCurricula;
    } catch (error) {
      console.error(`❌ Error getting all curricula: ${error.message}`);
      return [];
    }
  }

  /**
   * Get curricula by department
   */
  async getCurriculaByDepartment(department) {
    try {
      const dept = department.toLowerCase();
      const collection = this.db.db.collection(`curriculum_${dept}`);
      return await collection.find({ data_type: 'curriculum' }).toArray();
    } catch (error) {
      console.error(`❌ Error getting curricula: ${error.message}`);
      return [];
    }
  }

  /**
   * Get curricula by course
   */
  async getCurriculaByCourse(course) {
    try {
      const allCurricula = await this.getAllCurricula();
      return allCurricula.filter(curr => curr.course === course.toUpperCase());
    } catch (error) {
      console.error(`❌ Error getting curricula by course: ${error.message}`);
      return [];
    }
  }

  /**
   * Get curriculum statistics
   */
  async getCurriculumStatistics() {
    try {
      const allCurricula = await this.getAllCurricula();

      const stats = {
        total_curricula: allCurricula.length,
        by_department: {},
        by_course: {},
        by_year: {},
        total_subjects_all: 0
      };

      allCurricula.forEach(curriculum => {
        // By department
        const dept = curriculum.department || 'UNKNOWN';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // By course
        const course = curriculum.course || 'UNKNOWN';
        stats.by_course[course] = (stats.by_course[course] || 0) + 1;

        // By effective year
        const year = curriculum.effective_year || 'UNKNOWN';
        stats.by_year[year] = (stats.by_year[year] || 0) + 1;

        // Total subjects
        stats.total_subjects_all += curriculum.total_subjects || 0;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting curriculum statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all curricula
   */
  async clearAllCurricula() {
    try {
      console.log('🔍 Searching for curriculum collections...');

      // Get the actual MongoDB database object
      const database = this.db.db || this.db.client.db();

      // Get ALL collections in the database
      const collections = await database.listCollections().toArray();

      let totalCleared = 0;
      let collectionsFound = 0;

      // Find and clear all collections that start with 'curriculum_'
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;

        // Check if this is a curriculum collection
        if (collectionName.startsWith('curriculum_')) {
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

              console.log(`   ✅ Cleared ${result.deletedCount} curriculum record(s) from ${collectionName}`);
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
        console.log('ℹ️  No curriculum collections found in database');
      } else if (totalCleared > 0) {
        console.log(`✅ Total curriculum records cleared: ${totalCleared} from ${collectionsFound} collection(s)`);
      } else {
        console.log(`ℹ️  Found ${collectionsFound} collection(s) but they were already empty`);
      }

    } catch (error) {
      console.error(`❌ Error clearing curricula: ${error.message}`);
      console.error(error.stack);
    }
  }
}

export default CurriculumManager;