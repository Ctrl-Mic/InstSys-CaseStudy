import { Admin } from "mongodb";

class AdminManager {
  constructor(db) {
    this.db = db;
  }

  /**
   * Store admin data in department-specific collection
   */
  async storeAdmin(adminData) {
    try {
      const dept = (adminData.metadata.department || 'ADMIN').toLowerCase();
      
      // Get the admin collection for this department
      const collection = this.db.db.collection(`admin_${dept}`);
      
      const adminDoc = {
        // Identification
        admin_id: `ADMIN_${adminData.metadata.surname.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
        full_name: adminData.metadata.full_name,
        surname: adminData.metadata.surname,
        first_name: adminData.metadata.first_name,
        middle_name: adminData.metadata.middle_name,
        
        // Administrative Info
        department: adminData.metadata.department,
        position: adminData.metadata.position,
        admin_type: adminData.metadata.admin_type,
        employment_status: adminData.metadata.employment_status,
        
        // Contact Info
        email: adminData.metadata.email,
        phone: adminData.metadata.phone,
        
        // Full admin data
        admin_info: adminData.admin_data,
        
        // Formatted text
        formatted_text: adminData.formatted_text,
        
        // Metadata
        source_file: adminData.metadata.source_file,
        data_type: 'admin_excel',
        faculty_type: 'admin',
        created_at: adminData.metadata.created_at,
        updated_at: new Date()
      };
      
      // Insert the document
      const result = await collection.insertOne(adminDoc);
      
      console.log(`✅ Admin stored in: admin_${dept}`);
      console.log(`   Admin ID: ${adminDoc.admin_id}`);
      console.log(`   Name: ${adminDoc.full_name}`);
      console.log(`   Type: ${adminDoc.admin_type}`);
      console.log(`   MongoDB _id: ${result.insertedId}`);
      
      return adminDoc.admin_id;
      
    } catch (error) {
      console.error(`❌ Error storing admin: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all admins from all departments
   */
  async getAllAdmins() {
    try {
      const departments = ['admin', 'school_admin', 'board'];
      const allAdmins = [];

      for (const dept of departments) {
        try {
          const collection = this.db.db.collection(`admin_${dept}`);
          const admins = await collection.find({ data_type: 'admin_excel' }).toArray();
          allAdmins.push(...admins);
        } catch {
          // Collection might not exist yet
          continue;
        }
      }

      return allAdmins;
    } catch (error) {
      console.error(`❌ Error getting all admins: ${error.message}`);
      return [];
    }
  }

  /**
   * Get admins by department
   */
  async getAdminsByDepartment(department) {
    try {
      const dept = department.toLowerCase();
      const collection = this.db.db.collection(`admin_${dept}`);
      return await collection.find({ data_type: 'admin_excel' }).toArray();
    } catch (error) {
      console.error(`❌ Error getting admins: ${error.message}`);
      return [];
    }
  }

  /**
   * Get admins by type (School Administrator or Board Member)
   */
  async getAdminsByType(adminType) {
    try {
      const allAdmins = await this.getAllAdmins();
      return allAdmins.filter(admin => admin.admin_type === adminType);
    } catch (error) {
      console.error(`❌ Error getting admins by type: ${error.message}`);
      return [];
    }
  }

  /**
   * Search admin by name
   */
  async searchAdminByName(name) {
    try {
      const allAdmins = await this.getAllAdmins();
      return allAdmins.filter(admin => 
        admin.full_name.toLowerCase().includes(name.toLowerCase())
      );
    } catch (error) {
      console.error(`❌ Error searching admin: ${error.message}`);
      return [];
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStatistics() {
    try {
      const allAdmins = await this.getAllAdmins();
      
      const stats = {
        total_admins: allAdmins.length,
        by_department: {},
        by_type: {},
        by_employment_status: {}
      };

      allAdmins.forEach(admin => {
        // By department
        const dept = admin.department || 'UNKNOWN';
        stats.by_department[dept] = (stats.by_department[dept] || 0) + 1;

        // By type
        const type = admin.admin_type || 'Unknown';
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;

        // By employment status
        const status = admin.employment_status || 'Unknown';
        stats.by_employment_status[status] = (stats.by_employment_status[status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting admin statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear all admins
   */
  async clearAllAdmins() {
    try {
      console.log('🔍 Searching for admin collections...');
      
      // Get the actual MongoDB database object
      const database = this.db.db || this.db.client.db();
      
      // Get ALL collections in the database
      const collections = await database.listCollections().toArray();
      
      let totalCleared = 0;
      let collectionsFound = 0;

      // Find and clear all collections that start with 'admin_'
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        
        // Check if this is an admin collection
        if (collectionName.startsWith('admin_')) {
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
              
              console.log(`   ✅ Cleared ${result.deletedCount} admin(s) from ${collectionName}`);
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
        console.log('ℹ️  No admin collections found in database');
      } else if (totalCleared > 0) {
        console.log(`✅ Total admins cleared: ${totalCleared} from ${collectionsFound} collection(s)`);
      } else {
        console.log(`ℹ️  Found ${collectionsFound} collection(s) but they were already empty`);
      }
      
    } catch (error) {
      console.error(`❌ Error clearing admins: ${error.message}`);
      console.error(error.stack);
    }
  }
}

export default AdminManager;