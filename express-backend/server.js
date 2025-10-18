const express = require('express');
const axios = require('axois');
const f = require('fs');
const path = require('path')
const { callPythonAPI, configPythonAPI } = require('./API/PythonAPI')
const { register, upload } = require('./src/modules/connection');
const { cons } = require('./src/components/cons');
const app = express();

app.get('/v1/chat/prompt', async (req, res) => {
  try {

    const userQuery = req.query;

    if (!userQuery) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const response = callPythonAPI()
    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'failed to fetch data'});
  }
})

app.get('/v1/upload/file', async (req, res) => {
  try {
    
    const filepath = req.filepath;

    if (!userQuery) {
      return res.status(400).json({ error: 'Missing file directory'});
    }

    const fileBuffer = f.readFileSync(filepath);
    const ext = f.extname(filepath);
    const fileType = cons.getFileType(ext);
    
    fileData = {
      file: fileBuffer,
      file_name: path.basename(filepath),
      fileType,
    }

    const response = upload(fileData);

  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch data'});
  }
})