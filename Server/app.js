const express=require("express");
require("dotenv").config();
const app=express();
const cors=require('cors');
const port=process.env.PORT;
const fs=require("fs");
const morgan=require("morgan");
const mongoose=require("mongoose");

const usersRouter=require("./routes/usersRouter");
const expenseRoute=require('./routes/expenseRouter');
const paymentRoute=require("./routes/paymentRouter")
const premiumRouter=require("./routes/premiumRouter");
const geminiRouter=require("./routes/geminiRouter");
const passwordRouter=require("./routes/passwordRouter");
const reportsRouter=require("./routes/reportRouter");


const path = require("path");


require("./models/expense_details");
require("./models/ForgotPasswordRequests");
require("./models/payment");

require("./models/users_details");
require("./models/fileUrl");

//const accesslogStream=fs.createWriteStream(path.join(__dirname,'access.log',),{flags:'a'});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../Client")));
app.use(express.static('public'));




//app.use(morgan('combined',{stream:accesslogStream}));


app.use("/user",usersRouter)
app.use('/expense',expenseRoute)
app.use('/',paymentRoute)
app.use('/premium',premiumRouter);
app.use("/password",passwordRouter);

app.use('/reports',reportsRouter);

app.use('/gemini',geminiRouter);
app.get("/", (req, res) => {
    res.redirect("/SignupLogin/main.html");
  });


  (async () => {
    try {
     await mongoose.connect(process.env.MONGO_URL);
     app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
    });
    } catch (err) {
      console.error("Server startup failed:", err);
   }
 })();

