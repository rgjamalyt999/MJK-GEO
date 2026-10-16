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

  const { roll, reg, key } = req.query;
  const MASTER_KEY = "Jamal";

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
      message: "Bhai, URL me Roll No. ya Registration No. dono me se koi ek jarur dalo! (Example: &roll=123 ya &reg=456)",
      developer: "Hacker Jamal",
      group: "The logical thinks"
    });
  }

  // Data ko clean karne ka function taaki .0 ya extra space se error na aaye
  const cleanText = (text) => {
    if (!text) return "";
    return text.toString().replace(/\.0$/, '').trim().toLowerCase();
  };

  const searchValue = cleanText(roll || reg);
  
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
        // Roll No. aur Registration No. ke saare possible columns check karna
        const rowRoll = cleanText(row['College Roll Number'] || row['Roll No'] || row['roll'] || row['Roll'] || row['Roll Number']);
        const rowReg = cleanText(row['Registration Number'] || row['Registration No'] || row['reg'] || row['Registration'] || row['Reg No']);

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
        message: "Data nahi mila yaar, kisi bhi CSV file me ye Roll/Reg No. match nahi hua.",
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
