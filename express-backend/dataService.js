import retrieve_file from './src/modules/modules.requestFile.js';
import StudentDatabase from './src/modules/modules.StudentDatabase.js';
import processors from './src/utils/handler.js';
import { closeConnection } from './src/utils/handler.js';


class Connector {
  constructor(connectionString = null) {
    this.db = new StudentDatabase(connectionString);
  }

  async DataTransfer() {
    try {

      await this.db.connect();

      const fileDataArray = await retrieve_file();
      if (!fileDataArray || fileDataArray.length === 0) {
        console.log("No data returned from database");
        return [];
      }

      for (const data of fileDataArray) {
        const category = (data.file_category || "").trim().toLowerCase();
        const handler = processors[category];
        try {
          const extractedData = await handler.extract(data, this.db);
          if (!extractedData) {
            console.log(`${handler.errorMsg} has no extracted data`);
            continue;
          }
          await handler.store(extractedData, this.db);
        } catch (error) {
          console.error(`❌ Error processing ${handler.errorMsg}:`, error.message);
        }
      }

    } catch (error) {
      console.error('DataTransfer error:', error.message);
      throw error;
    } finally {
      closeConnection()
    }
  }

  async clearAllData() {
    try {
      await this.db.clearAllData();

    } catch (error) {
      console.error(`Error clearing data: ${error.message}`);
    }
  }
}

export default Connector;