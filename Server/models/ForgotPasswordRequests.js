const mongoose = require("mongoose");
const Schema=mongoose.Schema

const passReqSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
},{
    timestamps: true
});

module.exports = mongoose.model("PassReq", passReqSchema);