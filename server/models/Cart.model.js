import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true }, // snapshot at time of adding
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
});

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;