const mongoose = require("mongoose");
const Schema=mongoose.Schema;
const fileUrlSchema = new Schema({
  url: {
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

module.exports = mongoose.model("FileUrl", fileUrlSchema);