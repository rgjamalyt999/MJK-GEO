const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

export default function handler(req, res) {
  // CORS setup - Taaki tumhara HTML panel is API ko call kar sake bina error ke
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // API url se roll ya reg (registration) number nikalna
  const { roll, reg } = req.query;

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
    // Vercel me 'data' folder ko dhoondhna
    const dataDirectory = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDirectory);
    
    // Sirf CSV files ko select karna
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    let foundStudent = null;

    for (const file of csvFiles) {
      const filePath = path.join(dataDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // CSV File ko JSON me badalna
      const parsedData = Papa.parse(fileContent, {
        header: true, 
        skipEmptyLines: true
      });

      // Har row me student ko dhundhna
      for (const row of parsedData.data) {
        // Tumhari CSV me inme se koi bhi column name ho sakta hai
        const rowRoll = (row['Roll No'] || row['roll'] || row['Roll'] || row['Roll Number'] || '').toString().trim().toLowerCase();
        const rowReg = (row['Registration No'] || row['reg'] || row['Registration'] || row['Reg No'] || '').toString().trim().toLowerCase();

        if (rowRoll === searchValue || rowReg === searchValue) {
          foundStudent = row;
          break; // Student mil gaya, loop roko
        }
      }

      if (foundStudent) break; // Student mil gaya, agli file check mat karo
    }

    if (foundStudent) {
      // Agar Data Mil Gaya
      return res.status(200).json({
        status: "Success",
        data: foundStudent,
        developer: "Hacker Jamal",
        group: "The logical thinks"
      });
    } else {
      // Agar Data Nahi Mila
      return res.status(404).json({
        status: "Not Found",
        message: "Data nahi mila yaar, kisi bhi CSV file me ye Roll/Reg No. nahi hai.",
        developer: "Hacker Jamal",
        group: "The logical thinks"
      });
    }

  } catch (error) {
    // Agar server me koi error aaye
    return res.status(500).json({
      status: "Error",
      message: "Server me problem aa gayi hai.",
      errorDetail: error.message,
      developer: "Hacker Jamal",
      group: "The logical thinks"
    });
  }
}
