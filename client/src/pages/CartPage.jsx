import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { removeFromCart, updateQty, selectCartTotal } from "@/store/slices/cartSlice";

export default function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Add some books to get started.</p>
        <Link to="/books"><Button className="mt-6">Browse Books</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map(item => {
            // Ensure we have a valid ID regardless of where the item originated
            const itemId = item.id || item._id || (item.book && (item.book.id || item.book._id));
            return (
            <Card key={itemId} className="flex gap-4 p-4">
              <Link to={`/books/${itemId}`}>
                <img src={item.coverImage} alt={item.title} className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded" />
              </Link>
              <div className="flex-1 min-w-0 flex flex-col">
                <Link to={`/books/${itemId}`} className="font-semibold hover:text-primary line-clamp-2">{item.title}</Link>
                <p className="text-sm text-muted-foreground">{item.author}</p>
                <p className="font-semibold mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                <div className="mt-auto flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center rounded-md border">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => dispatch(updateQty({ id: itemId, quantity: item.quantity - 1 }))}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => dispatch(updateQty({ id: itemId, quantity: item.quantity + 1 }))}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => dispatch(removeFromCart(itemId))}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </Card>
          )})}
        </div>
        <Card className="p-6 h-fit lg:sticky lg:top-20 space-y-3">
          <h2 className="font-semibold text-lg">Order Summary</h2>
          <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </Button>
          <Link to="/books" className="block text-center text-sm text-primary hover:underline">Continue shopping</Link>
        </Card>
      </div>
    </div>
  );
}
