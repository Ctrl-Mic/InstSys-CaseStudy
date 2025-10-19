const { StudentDatabase, StudentDataExtractor } = require('./utils/main');
const { retrieve_file } = require('./src/modules/requestFile');
const { StudentSchema } = require('./src/components/constructor');

async function DataTransfer() {
  try {
    console.log('🔄 Starting file retrieval...');
    
    // Use the specific MongoDB ID
    
    const fileData = await retrieve_file();
    
    if (fileData) {
      console.log('✅ File retrieved successfully');
      console.log('📑 File Details:');
      console.log('   Name:', fileData.file_name);
      console.log('   Type:', fileData.fileType);
      
      if (fileData.text) {
        console.log('\n📄 Content Preview:');
        console.log(fileData.text.substring(0, 200) + '...');
      }
    } else {
      console.log('❌ No data returned from file retrieval');
    }

  } catch (error) {
    console.error('❌ Error in DataTransfer:', error.message);
    console.error('   Details:', error.stack);
  }
}

// Run the function
DataTransfer().finally(() => {
  console.log('\n👋 Process complete');
  process.exit(0);
});