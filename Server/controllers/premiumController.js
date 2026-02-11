const User=require("../models/users_details");
const Expense=require("../models/expense_details");
const FileUrl=require("../models/fileUrl");
const getLeaderboard=async(req,res)=>{
    try {
     
        const leaderboard=await User.find().select("_id name totalExpense totalIncome").sort({
         tottalExpense :1
        }
        )
    
        res.status(200).json(leaderboard);
      } 
    catch(err)
    {
        res.status(500).json({message:err.message});
    }
    
}


const getFileUrls=async(req,res)=>{
    try{
        const fileUrls=await FileUrl.find({userId:req.user._id});
        res.status(200).json(fileUrls);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

module.exports={
    getLeaderboard,
    getFileUrls
}