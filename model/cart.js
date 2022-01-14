const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CartSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      ipAddress: {
        type: String
     
      },
      products: [
        {
          productId: String,
          quantity: Number,
          name: String,
          price: Number
        }
      ],
      active: {
        type: Boolean,
        default: true
      },
      modifiedOn: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
  );
  module.exports = mongoose.model("Cart", CartSchema);
  