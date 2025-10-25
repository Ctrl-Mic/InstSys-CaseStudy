class NonTeachingFacultyManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store non-teaching faculty in department-specific collection
   */
  async storeNonTeachingFaculty(facultyData) {
  try {
    const dept = (facultyData.metadata.department || 'ADMIN_SUPPORT').toLowerCase();
    
    // Get the non-teaching faculty collection for this department
    const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);
    
    const facultyDoc = {
      // Identification
      faculty_id: `NON_TEACHING_${facultyData.metadata.department}_${Date.now()}`,
      full_name: facultyData.metadata.full_name,
      surname: facultyData.metadata.surname,
      first_name: facultyData.metadata.first_name,
      
      // Personal Information
      date_of_birth: facultyData.faculty_info.date_of_birth,
      place_of_birth: facultyData.faculty_info.place_of_birth,
      citizenship: facultyData.faculty_info.citizenship,
      sex: facultyData.faculty_info.sex,
      height: facultyData.faculty_info.height,
      weight: facultyData.faculty_info.weight,
      blood_type: facultyData.faculty_info.blood_type,
      religion: facultyData.faculty_info.religion,
      civil_status: facultyData.faculty_info.civil_status,
      
      // Contact Information
      address: facultyData.faculty_info.address,
      zip_code: facultyData.faculty_info.zip_code,
      phone: facultyData.faculty_info.phone,
      email: facultyData.faculty_info.email,
      
      // Professional Information
      position: facultyData.metadata.position,
      department: facultyData.metadata.department,
      employment_status: facultyData.metadata.employment_status,
      
      // ← ADD THIS: Biometric descriptor
      descriptor: facultyData.faculty_info.descriptor || null,
      
      // ← ADD THIS: Media fields (image and audio)
      image: {
        data: null,
        filename: null,
        status: 'waiting'  // waiting for upload
      },
      audio: {
        data: null,
        filename: null,
        status: 'waiting'  // waiting for upload
      },
      
      // Family Information
      family_info: {
        father: {
          name: facultyData.faculty_info.father_name,
          date_of_birth: facultyData.faculty_info.father_dob,
          occupation: facultyData.faculty_info.father_occupation
        },
        mother: {
          name: facultyData.faculty_info.mother_name,
          date_of_birth: facultyData.faculty_info.mother_dob,
          occupation: facultyData.faculty_info.mother_occupation
        },
        spouse: {
          name: facultyData.faculty_info.spouse_name,
          date_of_birth: facultyData.faculty_info.spouse_dob,
          occupation: facultyData.faculty_info.spouse_occupation
        }
      },
      
      // Government IDs
      government_ids: {
        gsis: facultyData.faculty_info.gsis,
        philhealth: facultyData.faculty_info.philhealth
      },
      
      //Field status tracking
      field_status: {
        personal_info: 'complete',
        contact_info: 'complete',
        professional_info: 'complete',
        image: 'waiting',
        audio: 'waiting',
        descriptor: facultyData.faculty_info.descriptor ? 'complete' : 'waiting'
      },
      
      // Completion percentage
      completion_percentage: this._calculateNonTeachingFacultyCompletion(facultyData),
      
      // Full formatted text for display
      formatted_text: facultyData.formatted_text,
      
      // Metadata
      source_file: facultyData.metadata.source_file,
      data_type: 'non_teaching_faculty',
      faculty_type: 'non_teaching',
      created_at: facultyData.metadata.created_at,
      updated_at: new Date()
    };
    
    // Insert the document
    const result = await collection.insertOne(facultyDoc);
    
    // ← ADD THIS: Add to pending media if waiting for image/audio
    await this._addNonTeachingToPendingMedia(facultyDoc);
    
    console.log(`✅ Non-teaching faculty stored in: non_teaching_faculty_${dept}`);
    console.log(`   Faculty ID: ${facultyDoc.faculty_id}`);
    console.log(`   Completion: ${facultyDoc.completion_percentage.toFixed(1)}%`);
    console.log(`   MongoDB _id: ${result.insertedId}`);
    
    return facultyDoc.faculty_id;
    
  } catch (error) {
    console.error(`❌ Error storing non-teaching faculty: ${error.message}`);
    return null;
  }
}

  /**
 * Calculate completion percentage for non-teaching faculty
 */
_calculateNonTeachingFacultyCompletion(facultyData) {
  const totalFields = 9; // personal + contact + professional + image + audio + descriptor
  let completed = 0;

  // Personal info (if has surname and first name)
  if (facultyData.faculty_info.surname && facultyData.faculty_info.first_name) {
    completed++;
  }

  // Contact info (if has phone or email)
  if (facultyData.faculty_info.phone || facultyData.faculty_info.email) {
    completed++;
  }

  // Professional info (if has position and department)
  if (facultyData.metadata.position && facultyData.metadata.department) {
    completed++;
  }

  // Address
  if (facultyData.faculty_info.address) {
    completed++;
  }

  // GSIS or PhilHealth
  if (facultyData.faculty_info.gsis || facultyData.faculty_info.philhealth) {
    completed++;
  }

  // Civil Status
  if (facultyData.faculty_info.civil_status) {
    completed++;
  }

  // Image (not yet uploaded, so doesn't count)
  // Audio (not yet uploaded, so doesn't count)
  // Descriptor (check if exists)
  if (facultyData.faculty_info.descriptor) {
    completed++;
  }

  return (completed / totalFields) * 100;
}

/**
 * Add non-teaching faculty to pending media collection
 */
async _addNonTeachingToPendingMedia(facultyDoc) {
  try {
    const pendingDoc = {
      faculty_id: facultyDoc.faculty_id,
      full_name: facultyDoc.full_name,
      position: facultyDoc.position,
      department: facultyDoc.department,
      faculty_type: 'non_teaching',
      waiting_for: {
        image: facultyDoc.image.status === 'waiting',
        audio: facultyDoc.audio.status === 'waiting',
        descriptor: !facultyDoc.descriptor
      },
      added_at: new Date()
    };

    await this.db.db.collection('pending_media').updateOne(
      { faculty_id: facultyDoc.faculty_id },
      { $set: pendingDoc },
      { upsert: true }
    );

    console.log(`   📝 Added to pending media queue`);
  } catch (error) {
    console.error(`   ⚠️  Error adding to pending media: ${error.message}`);
  }
}

/**
 * Update non-teaching faculty media (image or audio)
 */
async updateNonTeachingMedia(facultyId, mediaType, mediaData, filename, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);

    const updateData = {
      [`${mediaType}.data`]: mediaData,
      [`${mediaType}.filename`]: filename,
      [`${mediaType}.status`]: 'complete',
      [`field_status.${mediaType}`]: 'complete',
      updated_at: new Date()
    };

    const result = await collection.updateOne(
      { faculty_id: facultyId },
      { $set: updateData }
    );

    if (result.modifiedCount > 0) {
      await this._updateNonTeachingCompletion(facultyId, department);
      await this._checkNonTeachingMediaComplete(facultyId, department);
      console.log(`✅ Updated ${mediaType} for non-teaching faculty ${facultyId}`);
      return true;
    } else {
      console.log(`⚠️  Non-teaching faculty ${facultyId} not found`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error updating non-teaching media: ${error.message}`);
    return false;
  }
}

/**
 * Update non-teaching faculty descriptor
 */
async updateNonTeachingDescriptor(facultyId, descriptor, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);

    const result = await collection.updateOne(
      { faculty_id: facultyId },
      { 
        $set: { 
          descriptor: descriptor,
          'field_status.descriptor': 'complete',
          updated_at: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      await this._updateNonTeachingCompletion(facultyId, department);
      console.log(`✅ Updated descriptor for non-teaching faculty ${facultyId}`);
      return true;
    } else {
      console.log(`⚠️  Non-teaching faculty ${facultyId} not found`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error updating non-teaching descriptor: ${error.message}`);
    return false;
  }
}

/**
 * Update completion percentage for non-teaching faculty
 */
async _updateNonTeachingCompletion(facultyId, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);
    const faculty = await collection.findOne({ faculty_id: facultyId });
    
    if (!faculty) return;

    const totalFields = 9;
    let completed = 0;

    // Check each field
    if (faculty.surname && faculty.first_name) completed++;
    if (faculty.phone || faculty.email) completed++;
    if (faculty.position && faculty.department) completed++;
    if (faculty.address) completed++;
    if (faculty.government_ids?.gsis || faculty.government_ids?.philhealth) completed++;
    if (faculty.civil_status) completed++;
    if (faculty.image?.status === 'complete') completed++;
    if (faculty.audio?.status === 'complete') completed++;
    if (faculty.descriptor) completed++;

    const completion = (completed / totalFields) * 100;

    await collection.updateOne(
      { faculty_id: facultyId },
      { $set: { completion_percentage: completion } }
    );
  } catch (error) {
    console.error(`❌ Error updating non-teaching completion: ${error.message}`);
  }
}

/**
 * Check if non-teaching faculty media is complete and remove from pending
 */
async _checkNonTeachingMediaComplete(facultyId, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);
    const faculty = await collection.findOne({ faculty_id: facultyId });
    
    if (!faculty) return;

    const imageComplete = faculty.image?.status === 'complete';
    const audioComplete = faculty.audio?.status === 'complete';
    const descriptorComplete = !!faculty.descriptor;

    if (imageComplete && audioComplete && descriptorComplete) {
      await this.db.db.collection('pending_media').deleteOne({ faculty_id: facultyId });
      console.log(`   🎉 Non-teaching faculty ${facultyId} completed all media requirements`);
    }
  } catch (error) {
    console.error(`❌ Error checking non-teaching media completion: ${error.message}`);
  }
}

/**
 * Get non-teaching faculty pending media
 */
async getNonTeachingPendingMedia() {
  try {
    return await this.db.db.collection('pending_media').find({ 
      faculty_type: 'non_teaching' 
    }).toArray();
  } catch (error) {
    console.error(`❌ Error getting non-teaching pending media: ${error.message}`);
    return [];
  }
}

  /**
   * Get all non-teaching faculty from all departments
   */
  async getAllNonTeachingFaculty() {
    try {
      const departments = [
        'registrar', 'accounting', 'guidance', 'library', 
        'health_services', 'maintenance_custodial', 'security', 
        'system_admin', 'admin_support'
      ];
      const allFaculty = [];

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);
          const faculty = await collection.find({ data_type: 'non_teaching_faculty' }).toArray();
          allFaculty.push(...faculty);
        } catch {
          // Collection might not exist yet
          continue;
        }
      }

      return allFaculty;
    } catch (error) {
      console.error(`❌ Error getting all non-teaching faculty: ${error.message}`);
      return [];
    }
  }

  /**
   * Get non-teaching faculty by department
   */
  async getNonTeachingFacultyByDepartment(department) {
    try {
      const dept = department.toLowerCase();
      const collection = this.db.db.collection(`non_teaching_faculty_${dept}`);
      return await collection.find({ data_type: 'non_teaching_faculty' }).toArray();
    } catch (error) {
      console.error(`❌ Error getting non-teaching faculty: ${error.message}`);
      return [];
    }
  }

  /**
   * Get non-teaching faculty statistics
   */
  async getNonTeachingFacultyStatistics() {
    try {
      const allFaculty = await this.getAllNonTeachingFaculty();
      
      const stats = {
        total_faculty: allFaculty.length,
        by_department: {},
        by_position: {},
        by_employment_status: {}
      };

      allFaculty.forEach(faculty => {
        // By department
        const dept = faculty.department || 'ADMIN_SUPPORT';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // By position
        const position = faculty.position || 'UNKNOWN';
        stats.by_position[position] = (stats.by_position[position] || 0) + 1;

        // By employment status
        const status = faculty.employment_status || 'UNKNOWN';
        stats.by_employment_status[status] = (stats.by_employment_status[status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting non-teaching faculty statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all non-teaching faculty
   */
  async clearAllNonTeachingFaculty() {
    try {
      // Get ALL collections in the database
      const collections = await this.db.db.listCollections().toArray();
      
      let totalCleared = 0;

      // Find all collections that start with 'non_teaching_faculty_'
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        
        // Check if this is a non-teaching faculty collection
        if (collectionName.startsWith('non_teaching_faculty_')) {
          try {
            const collection = this.db.db.collection(collectionName);
            const result = await collection.deleteMany({ data_type: 'non_teaching_faculty' });
            
            if (result.deletedCount > 0) {
              console.log(`   Cleared ${result.deletedCount} non-teaching faculty record(s) from ${collectionName}`);
              totalCleared += result.deletedCount;
            }
          } catch (error) {
            console.error(`   ⚠️  Error clearing ${collectionName}: ${error.message}`);
            continue;
          }
        }
      }

      if (totalCleared > 0) {
        console.log(`✅ Total non-teaching faculty records cleared: ${totalCleared}`);
      } else {
        console.log('ℹ️  No non-teaching faculty records to clear');
      }
    } catch (error) {
      console.error(`❌ Error clearing non-teaching faculty: ${error.message}`);
    }
  }
}

export default NonTeachingFacultyManager;