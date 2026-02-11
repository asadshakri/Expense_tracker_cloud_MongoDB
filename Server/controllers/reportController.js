const Expense = require("../models/expense_details");
const User=require("../models/users_details");
const mongoose=require("mongoose");
const AWS=require('aws-sdk');
require('dotenv').config();
const FileUrl = require("../models/fileUrl");

const reportGenerate = async (req, res) => {
  try {
    const userId = req.user._id;
     

    const allExpenses =  await Expense.find({ userId })
    .select("_id income expenseAmount description category createdAt")
    .sort({ createdAt: 1 });

    if (!allExpenses.length) {
      return res.status(404).json({ message: "No expenses found for this user." });
    }

 
    const now = new Date();

    const filterByRange = (expenses, start, end) =>
      expenses.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= start && d < end;
      });
    
 
    const dates = allExpenses.map(e => new Date(e.createdAt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
 
    minDate.setHours(0,0,0,0);
    maxDate.setHours(0,0,0,0);
    
   
    let csvData = "";
    const writeSection = (title, data) => {
      csvData += `=== ${title} ===\n`;
      csvData += "Date,Description,Category,Amount,Income\n";
      if (data.length === 0) {
        csvData += "No records found\n\n";
        return;
      }
      data.forEach((e) => {
        const dateStr = new Date(e.createdAt).toISOString().split("T")[0];
        csvData += `${dateStr},"${e.description}","${e.category}",${e.expenseAmount},${e.income}\n`;
      });
      csvData += "\n\n";
    };
    

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);
    const dailyExpenses = filterByRange(allExpenses, startOfDay, endOfDay);
    writeSection("DAILY EXPENSES", dailyExpenses);
    
   
    let weekStart = new Date(minDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); 
    while (weekStart < maxDate) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
    
      const weeklyExpenses = filterByRange(allExpenses, weekStart, weekEnd);
      const title = `WEEKLY EXPENSES (${weekStart.toDateString()} - ${new Date(weekEnd - 1).toDateString()})`;
      writeSection(title, weeklyExpenses);
    
      weekStart = weekEnd;
    }
    
  
    let monthStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (monthStart <= maxDate) {
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    
      const monthlyExpenses = filterByRange(allExpenses, monthStart, monthEnd);
      const monthName = monthStart.toLocaleString("default", { month: "long", year: "numeric" });
      const title = `MONTHLY EXPENSES (${monthName})`;
      writeSection(title, monthlyExpenses);
    
      monthStart = monthEnd;
    }
    
    const filename = `expense_report_${userId}_${Date.now()}.csv`;

    // Upload to S3
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    const IAM_USER_KEY = process.env.AWS_ACCESS_KEY;
    const IAM_USER_SECRET = process.env.AWS_SECRET_KEY;

    let s3Bucket=new AWS.S3({
      accessKeyId:IAM_USER_KEY,
      secretAccessKey:IAM_USER_SECRET,

    });

      var params={
        Bucket:BUCKET_NAME,
        Key:filename,
        Body:csvData,
        ACL:'public-read'
      };
      const fileUrl= await new Promise((resolve,reject)=>{
        s3Bucket.upload(params,(err,res)=>{
        if(err){
          console.log('Error in S3 upload:',err);
          reject(err);
        }
        else{
        console.log('Successfully uploaded report to S3:',res);
        resolve(res.Location);
        }
      });
    });



    const newFile=new FileUrl({
      url: fileUrl,
      userId: userId
    })

    await newFile.save();  

    res.status(200).json({
      message: "Report generated successfully!",
      downloadUrl: fileUrl
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Failed to generate report." });
  }
};

module.exports = {
     reportGenerate 
};
