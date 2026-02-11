const mongoose = require("mongoose");
const Schema=mongoose.Schema

const paymentSchema = new Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentSessionId: {
    type: String
  },
  orderAmount: {
    type: Number,
    required: true
  },
  orderCurrency: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
},{
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);
