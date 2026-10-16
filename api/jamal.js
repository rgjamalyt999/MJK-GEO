const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // URL se roll, reg aur key nikalna
  const { roll, reg, key } = req.query;
  
  // Tumhari Master API Key
  const MASTER_KEY = "Jamal";

  // API Key Check karna
  if (!key || key !== MASTER_KEY) {
    return res.status(401).json({
      status: "Access Denied",
      message: "Bhai, API key missing ya invalid hai! Hacker Jamal se valid key lijiye.",
      developer: "Hacker Jamal",
      group: "The logical thinks"
    });
  }

  if (!roll && !reg) {
    return res.status(400).json({
      status: "Error",
      message: "Bhai, URL me Roll No. ya Registration No. jarur dalo! (Example: ?roll=123)",
      developer: "Hacker Jamal",
      group: "The logical thinks"
    });
  }

  const searchValue = (roll || reg).toString().trim().toLowerCase();
  
  try {
    const dataDirectory = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDirectory);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    let foundStudent = null;

    for (const file of csvFiles) {
      const filePath = path.join(dataDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const parsedData = Papa.parse(fileContent, {
        header: true, 
        skipEmptyLines: true
      });

      for (const row of parsedData.data) {
        const rowRoll = (row['Roll No'] || row['roll'] || row['Roll'] || row['Roll Number'] || '').toString().trim().toLowerCase();
        const rowReg = (row['Registration No'] || row['reg'] || row['Registration'] || row['Reg No'] || '').toString().trim().toLowerCase();

        if (rowRoll === searchValue || rowReg === searchValue) {
          foundStudent = row;
          break; 
        }
      }
      if (foundStudent) break; 
    }

    if (foundStudent) {
      return res.status(200).json({
        status: "Success",
        data: foundStudent,
        developer: "Hacker Jamal",
        group: "The logical thinks"
      });
    } else {
      return res.status(404).json({
        status: "Not Found",
        message: "Data nahi mila yaar, kisi bhi CSV file me ye Roll/Reg No. nahi hai.",
        developer: "Hacker Jamal",
        group: "The logical thinks"
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Server me problem aa gayi hai.",
      errorDetail: error.message,
      developer: "Hacker Jamal",
      group: "The logical thinks"
    });
  }
}
