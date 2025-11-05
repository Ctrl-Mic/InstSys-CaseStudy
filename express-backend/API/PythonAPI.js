import axios from "axios";
import cron from "node-cron";

let execution_mode = 'offline';

export async function callPythonAPI(userQuery) {
  try {
    console.log("Calling Python API with query:", userQuery);

    if (!userQuery) throw new Error("Missing query");

    const response = await axios.post(
      "http://localhost:5001/v1/chat/prompt/response",
      { query: userQuery },
      { responseType: userQuery.expectImage ? "arraybuffer" : "json" }
    );

    return response.data;
  } catch (error) {
    console.error("Error calling Python API:", error.response?.data || error.message);
    throw error;
  }
}

async function networkChecker() {
  try {

    const response = await axios.get("https://clients3.google.com/generate_204", { timeout: 3000 });
    if (response.status === 204) {
      return "online";
    } else {
      return "offline";
    }

  } catch (error) {
    console.error("Network Checker Failed.");
    return "offline";
  }
}

export async function configPythonAPI() {

  try {
    await axios.post('http://localhost:5001/v1/chat/prompt/status');
    console.log("Startup Initialization");
  } catch (error) {
    console.error("Error First Initialization");
  }

  cron.schedule("*/10 * * * * *", async function () {
    try {
      const new_mode = await networkChecker();
      if (new_mode !== execution_mode) {

        execution_mode = new_mode;
        console.log("Configuring AI");
        try {
          await axios.post(`http://localhost:5001/v1/chat/prompt/mode/${execution_mode}`, {
            mode: execution_mode,
          });
          console.log(`CHANGING EXECUTION MODE ${execution_mode}`);
        } catch (error) {
          console.error("Error Updating Execution Mode:", error.message);
        }
      }
    } catch (error) {
      console.error("Error Sending Execution Mode.");
      throw error;
    }
  });
}