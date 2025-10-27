class TeachingFacultyManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store teaching faculty in department-specific collection
   */
  async storeTeachingFaculty(facultyData) {
  try {
    const dept = (facultyData.metadata.department || 'UNKNOWN').toLowerCase();
    
    // Get the faculty collection for this department
    const collection = this.db.db.collection(`faculty_${dept}`);
    
    const facultyDoc = {
      // Identification
      faculty_id: `FACULTY_${facultyData.metadata.department}_${Date.now()}`,
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
      
      // Field status tracking
      field_status: {
        personal_info: 'complete',
        contact_info: 'complete',
        professional_info: 'complete',
        image: 'waiting',
        audio: 'waiting',
        descriptor: facultyData.faculty_info.descriptor ? 'complete' : 'waiting'
      },
      
      // Completion percentage
      completion_percentage: this._calculateTeachingFacultyCompletion(facultyData),
      
      // Full formatted text for display
      formatted_text: facultyData.formatted_text,
      
      // Metadata
      source_file: facultyData.metadata.source_file,
      data_type: 'teaching_faculty',
      faculty_type: 'teaching',
      created_at: facultyData.metadata.created_at,
      updated_at: new Date()
    };
    
    // Insert the document
    const result = await collection.insertOne(facultyDoc);
    
    // ← ADD THIS: Add to pending media if waiting for image/audio
    await this._addTeachingToPendingMedia(facultyDoc);
    
    console.log(`✅ Teaching faculty stored in: faculty_${dept}`);
    console.log(`   Faculty ID: ${facultyDoc.faculty_id}`);
    console.log(`   Completion: ${facultyDoc.completion_percentage.toFixed(1)}%`);
    console.log(`   MongoDB _id: ${result.insertedId}`);
    
    return facultyDoc.faculty_id;
    
  } catch (error) {
    console.error(`❌ Error storing teaching faculty: ${error.message}`);
    return null;
  }
}

  /**
 * Calculate completion percentage for teaching faculty
 */
_calculateTeachingFacultyCompletion(facultyData) {
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
 * Add teaching faculty to pending media collection
 */
async _addTeachingToPendingMedia(facultyDoc) {
  try {
    const pendingDoc = {
      faculty_id: facultyDoc.faculty_id,
      full_name: facultyDoc.full_name,
      position: facultyDoc.position,
      department: facultyDoc.department,
      faculty_type: 'teaching',
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
 * Update teaching faculty media (image or audio)
 */
async updateTeachingMedia(facultyId, mediaType, mediaData, filename, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`faculty_${dept}`);

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
      await this._updateTeachingCompletion(facultyId, department);
      await this._checkTeachingMediaComplete(facultyId, department);
      console.log(`✅ Updated ${mediaType} for teaching faculty ${facultyId}`);
      return true;
    } else {
      console.log(`⚠️  Teaching faculty ${facultyId} not found`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error updating teaching media: ${error.message}`);
    return false;
  }
}

/**
 * Update teaching faculty descriptor
 */
async updateTeachingDescriptor(facultyId, descriptor, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`faculty_${dept}`);

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
      await this._updateTeachingCompletion(facultyId, department);
      console.log(`✅ Updated descriptor for teaching faculty ${facultyId}`);
      return true;
    } else {
      console.log(`⚠️  Teaching faculty ${facultyId} not found`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error updating teaching descriptor: ${error.message}`);
    return false;
  }
}

/**
 * Update completion percentage for teaching faculty
 */
async _updateTeachingCompletion(facultyId, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`faculty_${dept}`);
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
    console.error(`❌ Error updating teaching completion: ${error.message}`);
  }
}

/**
 * Check if teaching faculty media is complete and remove from pending
 */
async _checkTeachingMediaComplete(facultyId, department) {
  try {
    const dept = department.toLowerCase();
    const collection = this.db.db.collection(`faculty_${dept}`);
    const faculty = await collection.findOne({ faculty_id: facultyId });
    
    if (!faculty) return;

    const imageComplete = faculty.image?.status === 'complete';
    const audioComplete = faculty.audio?.status === 'complete';
    const descriptorComplete = !!faculty.descriptor;

    if (imageComplete && audioComplete && descriptorComplete) {
      await this.db.db.collection('pending_media').deleteOne({ faculty_id: facultyId });
      console.log(`   🎉 Teaching faculty ${facultyId} completed all media requirements`);
    }
  } catch (error) {
    console.error(`❌ Error checking teaching media completion: ${error.message}`);
  }
}

/**
 * Get teaching faculty pending media
 */
async getTeachingPendingMedia() {
  try {
    return await this.db.db.collection('pending_media').find({ 
      faculty_type: 'teaching' 
    }).toArray();
  } catch (error) {
    console.error(`❌ Error getting teaching pending media: ${error.message}`);
    return [];
  }
}

  /**
   * Get all teaching faculty from all departments
   */
  async getAllTeachingFaculty() {
    try {
      const departments = ['cas', 'ccs', 'chtm', 'cba', 'cte', 'coe', 'con', 'admin', 'unknown'];
      const allFaculty = [];

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`faculty_${dept}`);
          const faculty = await collection.find({ data_type: 'teaching_faculty' }).toArray();
          allFaculty.push(...faculty);
        } catch {
          // Collection might not exist yet
          continue;
        }
      }

      return allFaculty;
    } catch (error) {
      console.error(`❌ Error getting all teaching faculty: ${error.message}`);
      return [];
    }
  }

  /**
   * Get teaching faculty by department
   */
  async getTeachingFacultyByDepartment(department) {
    try {
      const dept = department.toLowerCase();
      const collection = this.db.db.collection(`faculty_${dept}`);
      return await collection.find({ data_type: 'teaching_faculty' }).toArray();
    } catch (error) {
      console.error(`❌ Error getting teaching faculty: ${error.message}`);
      return [];
    }
  }

  /**
   * Get teaching faculty statistics
   */
  async getTeachingFacultyStatistics() {
    try {
      const allFaculty = await this.getAllTeachingFaculty();
      
      const stats = {
        total_faculty: allFaculty.length,
        by_department: {},
        by_position: {},
        by_employment_status: {}
      };

      allFaculty.forEach(faculty => {
        // By department
        const dept = faculty.department || 'UNKNOWN';
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
      console.error(`❌ Error getting teaching faculty statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all teaching faculty
   */
  async clearAllTeachingFaculty() {
    try {
      const departments = ['cas', 'ccs', 'chtm', 'cba', 'cte', 'coe', 'con', 'admin', 'unknown'];
      let totalCleared = 0;

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`faculty_${dept}`);
          const result = await collection.deleteMany({ data_type: 'teaching_faculty' });
          
          if (result.deletedCount > 0) {
            console.log(`   Cleared ${result.deletedCount} faculty record(s) from faculty_${dept}`);
            totalCleared += result.deletedCount;
          }
        } catch {
          continue;
        }
      }

      if (totalCleared > 0) {
        console.log(`✅ Total teaching faculty records cleared: ${totalCleared}`);
      }
    } catch (error) {
      console.error(`❌ Error clearing teaching faculty: ${error.message}`);
    }
  }
}

export default TeachingFacultyManager;