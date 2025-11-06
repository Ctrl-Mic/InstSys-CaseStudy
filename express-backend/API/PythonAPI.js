import axios from "axios";
import cron from "node-cron";

let execution_mode = 'offline';
let isInitialized = false;

export async function callPythonAPI(userQuery, session_id = 22) {
  try {

    if (!userQuery || !session_id) throw new Error("Missing query");

    const response = await axios.post(
      "http://localhost:5001/v1/chat/prompt/response",
      { query: userQuery, session_id: session_id },
    );

    return response.data;
  } catch (error) {
    console.error("Error calling Python API:", error.response?.data || error.message);
    throw error;
  }
}

async function networkChecker() {
  try {

    const response = await axios.get(testUrl, {
      timeout,
      headers: { "Cache-Control": "no-cache" },
      maxRedirects: 0,
      validateStatus: () => true,
    });

    if (response.status === 204) {
      return "online";
    }

  } catch (error) {
    return "offline";
  }
}

export async function configPythonAPI() {

  if (isInitialized) {
    return;
  }

  try {
    await axios.post('http://localhost:5001/v1/chat/prompt/status');
    console.log("Startup Initialization");
    isInitialized = true;
  } catch (error) {
    console.error("Error First Initialization");
  }

  if (!isInitialized) {
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
}