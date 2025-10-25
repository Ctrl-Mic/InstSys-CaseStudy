class GeneralInfoManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store general info in MongoDB
   */
  async storeGeneralInfo(generalInfoData) {
    try {
      const infoType = generalInfoData.metadata.info_type;
      
      // Use a single collection for all general info
      const collection = this.db.db.collection('general_info');
      
      const infoDoc = {
        info_id: `INFO_${infoType.toUpperCase()}_${Date.now()}`,
        info_type: infoType,
        
        // Content based on type
        content: generalInfoData.content,
        
        // Raw and formatted text
        raw_text: generalInfoData.raw_text,
        formatted_text: generalInfoData.formatted_text,
        
        // Metadata
        source_file: generalInfoData.metadata.source_file,
        data_type: 'general_info_pdf',
        character_count: generalInfoData.metadata.character_count,
        extracted_at: generalInfoData.metadata.extracted_at,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Check if this info type already exists and update or insert
      const existing = await collection.findOne({ info_type: infoType });
      
      if (existing) {
        // Update existing
        await collection.updateOne(
          { info_type: infoType },
          { $set: infoDoc }
        );
        console.log(`✅ Updated ${infoType} in general_info collection`);
      } else {
        // Insert new
        const result = await collection.insertOne(infoDoc);
        console.log(`✅ Stored ${infoType} in general_info collection`);
        console.log(`   MongoDB _id: ${result.insertedId}`);
      }
      
      console.log(`   Info ID: ${infoDoc.info_id}`);
      console.log(`   Type: ${infoType}`);
      console.log(`   Characters: ${infoDoc.character_count}`);
      
      return infoDoc.info_id;
      
    } catch (error) {
      console.error(`❌ Error storing general info: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all general information
   */
  async getAllGeneralInfo() {
    try {
      const collection = this.db.db.collection('general_info');
      return await collection.find({}).toArray();
    } catch (error) {
      console.error(`❌ Error getting general info: ${error.message}`);
      return [];
    }
  }

  /**
   * Get general info by type
   */
  async getGeneralInfoByType(infoType) {
    try {
      const collection = this.db.db.collection('general_info');
      return await collection.findOne({ info_type: infoType });
    } catch (error) {
      console.error(`❌ Error getting general info: ${error.message}`);
      return null;
    }
  }

  /**
   * Get mission and vision
   */
  async getMissionVision() {
    return await this.getGeneralInfoByType('mission_vision');
  }

  /**
   * Get objectives
   */
  async getObjectives() {
    return await this.getGeneralInfoByType('objectives');
  }

  /**
   * Get history
   */
  async getHistory() {
    return await this.getGeneralInfoByType('history');
  }

  /**
   * Get core values
   */
  async getCoreValues() {
    return await this.getGeneralInfoByType('core_values');
  }

  /**
   * Get hymn
   */
  async getHymn() {
    return await this.getGeneralInfoByType('hymn');
  }

  /**
   * Search general info
   */
  async searchGeneralInfo(searchText) {
    try {
      const collection = this.db.db.collection('general_info');
      return await collection.find({
        $or: [
          { raw_text: { $regex: searchText, $options: 'i' } },
          { info_type: { $regex: searchText, $options: 'i' } }
        ]
      }).toArray();
    } catch (error) {
      console.error(`❌ Error searching general info: ${error.message}`);
      return [];
    }
  }

  /**
   * Get general info statistics
   */
  async getGeneralInfoStatistics() {
    try {
      const allInfo = await this.getAllGeneralInfo();
      
      const stats = {
        total_documents: allInfo.length,
        by_type: {},
        total_characters: 0
      };

      allInfo.forEach(info => {
        const type = info.info_type || 'unknown';
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;
        stats.total_characters += info.character_count || 0;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting general info statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all general info
   */
  async clearAllGeneralInfo() {
    try {
      console.log('🔍 Clearing general info collection...');
      
      const database = this.db.db || this.db.client.db();
      const collection = database.collection('general_info');
      
      const count = await collection.countDocuments();
      console.log(`   Documents in collection: ${count}`);
      
      if (count > 0) {
        const result = await collection.deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} general info document(s)`);
      } else {
        console.log(`ℹ️  General info collection is already empty`);
      }
      
    } catch (error) {
      console.error(`❌ Error clearing general info: ${error.message}`);
    }
  }

  /**
   * Update specific general info
   */
  async updateGeneralInfo(infoType, updates) {
    try {
      const collection = this.db.db.collection('general_info');
      const result = await collection.updateOne(
        { info_type: infoType },
        { 
          $set: {
            ...updates,
            updated_at: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${infoType}`);
        return true;
      } else {
        console.log(`⚠️  No document found for ${infoType}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error updating general info: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete specific general info
   */
  async deleteGeneralInfo(infoType) {
    try {
      const collection = this.db.db.collection('general_info');
      const result = await collection.deleteOne({ info_type: infoType });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted ${infoType}`);
        return true;
      } else {
        console.log(`⚠️  No document found for ${infoType}`);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Error deleting general info: ${error.message}`);
      return false;
    }
  }
}

export default GeneralInfoManager;