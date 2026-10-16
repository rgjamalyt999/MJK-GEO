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
      status: "Access Denied ❌",
      message: "Bhai, API key missing ya invalid hai! Hacker Jamal se valid key lijiye.",
      developer: "Hacker Jamal"
    });
  }

  if (!roll && !reg) {
    return res.status(400).json({
      status: "Bad Request ⚠️",
      message: "URL me Roll No. ya Registration No. dono me se koi ek jarur dalo! (Example: &roll=123)",
      developer: "Hacker Jamal"
    });
  }

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
      const vipData = {};
      
      for (let objKey in foundStudent) {
        let lowerKey = objKey.toLowerCase();
        
        // 💎 ULTRA VIP EMOJI MAPPING 💎
        let emoji = "✨"; // Default premium star kisi naye column ke liye
        
        if (lowerKey.includes('father')) emoji = "👨";
        else if (lowerKey.includes('mother')) emoji = "👩";
        else if (lowerKey.includes('student') || lowerKey.includes('name')) emoji = "👤";
        else if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact')) emoji = "📱";
        else if (lowerKey.includes('email') || lowerKey.includes('mail')) emoji = "📧";
        else if (lowerKey.includes('reg') || lowerKey.includes('id') || lowerKey.includes('roll')) emoji = "🪪";
        else if (lowerKey.includes('dob') || lowerKey.includes('birth') || lowerKey.includes('date')) emoji = "📅";
        else if (lowerKey.includes('gender') || lowerKey.includes('sex')) emoji = "🚻";
        else if (lowerKey.includes('blood')) emoji = "🩸"; // Blood group
        else if (lowerKey.includes('aadhar') || lowerKey.includes('pan')) emoji = "💳"; // ID Cards
        else if (lowerKey.includes('address') || lowerKey.includes('house') || lowerKey.includes('village')) emoji = "🏠";
        else if (lowerKey.includes('city') || lowerKey.includes('district')) emoji = "🏙️"; // City/District
        else if (lowerKey.includes('state') || lowerKey.includes('region')) emoji = "🗺️"; // State
        else if (lowerKey.includes('pin') || lowerKey.includes('zip') || lowerKey.includes('code')) emoji = "📍"; // Pincode
        else if (lowerKey.includes('circle')) emoji = "📡"; // Telecom Circle
        else if (lowerKey.includes('course') || lowerKey.includes('discipline') || lowerKey.includes('stream')) emoji = "🎓";
        else if (lowerKey.includes('sector') || lowerKey.includes('department')) emoji = "🏢";
        else if (lowerKey.includes('year') || lowerKey.includes('semester')) emoji = "🗓️"; // Semester/Year
        else if (lowerKey.includes('marks') || lowerKey.includes('grade') || lowerKey.includes('cgpa') || lowerKey.includes('percentage')) emoji = "📊"; // Results
        else if (lowerKey.includes('category') || lowerKey.includes('caste')) emoji = "🏷️"; // Category
        else if (lowerKey.includes('status')) emoji = "🟢";
        else if (lowerKey.includes('remark') || lowerKey.includes('note')) emoji = "📝";

        let finalValue = foundStudent[objKey];
        if (!finalValue || finalValue.trim() === "") finalValue = "N/A";

        vipData[`${emoji} ${objKey}`] = finalValue;
      }

      return res.status(200).json({
        status: "Success ✅",
        data: vipData,
        developer: "Hacker Jamal 👑"
      });
      
    } else {
      return res.status(404).json({
        status: "Not Found 🔍",
        message: "Data nahi mila yaar",
        developer: "Hacker Jamal"
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: "Server Error 🚨",
      message: "Internal server error aa gayi hai.",
      errorDetail: error.message,
      developer: "Hacker Jamal"
    });
  }
}
