const Expense = require("../models/expense_details");
const User=require("../models/users_details");

const mongoose = require("mongoose");

const fetchexpenses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [expenses, count] = await Promise.all([
      Expense.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Expense.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({
      expenses,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalExpenses: count
    });

  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: error.message });
  }
};

const addexpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { income, expenseamount, description, category} = req.body;
      const Texpense= req.user.totalExpense + expenseamount;
      const Tincome= req.user.totalIncome+ income;
      if(Tincome<Texpense)
      {
            return res.status(400).json({
                message: "Expense exceeds available income"
              });
      }

      const expense = await Expense.create(
        [{
          income,
          expenseAmount: expenseamount,
          description,
          category,
          userId: req.user._id
        }],
        { session }
      );
  
      await User.updateOne(
        { _id: req.user._id },
        {
          $inc: {
            totalExpense: expenseamount,
            totalIncome: income
          }
        },
        { session }
      );
  
      await session.commitTransaction();
      session.endSession();
  
      res.status(201).json(expense);
  
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
  
      console.error("Error adding expense:", error);
      res.status(500).json({ message: error.message });
    }
  }

  const deleteexpense = async (req, res) => {
    const session = await mongoose.startSession();
     session.startTransaction();
  
    try {
      const { id } = req.params;
  
      const expense = await Expense.findOne(
        { _id: id, userId: req.user._id }
      )
      .select("expenseAmount income")
      .session(session);
  
      if (!expense) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Expense not found" });
      }
  
      await Expense.deleteOne(
        { _id: id, userId: req.user._id },
        { session }
      );
  
      await User.updateOne(
        { _id: req.user._id },
        {
          $inc: {
            totalExpense: -expense.expenseAmount,
            totalIncome: -expense.income
          }
        },
        { session }
      );
  
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({ message: "Expense deleted successfully" });
  
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
  
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: error.message });
    }
  };

module.exports={
    fetchexpenses,
    addexpense,
    deleteexpense
};