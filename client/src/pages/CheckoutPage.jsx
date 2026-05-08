import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { selectCartTotal } from "@/store/slices/cartSlice";
import { toast } from "sonner";

export default function CheckoutPage() {
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectCartTotal);
  const user = useSelector((s) => s.auth?.user);
  const navigate = useNavigate();

  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shipping;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement your actual API call here
    // const res = await fetch('http://localhost:5000/api/orders', { ... })
    
    setTimeout(() => {
      setLoading(false);
      toast.success("Order placed successfully!");
      // Usually, you would dispatch an action to clear the cart here:
      // dispatch(clearCart());
      navigate("/");
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">You need items in your cart to checkout.</p>
        <Link to="/books"><Button>Browse Books</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        
        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input required name="name" value={form.name} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input required name="phone" type="tel" value={form.phone} onChange={handleChange} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input required name="address" value={form.address} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>City</Label><Input required name="city" value={form.city} onChange={handleChange} /></div>
              <div className="space-y-2"><Label>Postal Code</Label><Input required name="postalCode" value={form.postalCode} onChange={handleChange} /></div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Payment Method</h2>
            <div className="space-y-3">
              {["cod", "upi", "card"].map((method) => (
                <label key={method} className="flex items-center space-x-3 border p-4 rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                  <input type="radio" name="paymentMethod" value={method} checked={form.paymentMethod === method} onChange={handleChange} className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {method === "cod" ? "Cash on Delivery" : method === "upi" ? "UPI (GPay, PhonePe, Paytm)" : "Credit / Debit Card"}
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </form>

        <Card className="p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold border-b pb-2">Order Summary</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {items.map((item) => {
              const itemId = item.id || item._id || (item.book && (item.book.id || item.book._id));
              return (
                <div key={itemId} className="flex justify-between text-sm">
                  <span className="line-clamp-1 flex-1 pr-4">{item.title} <span className="text-muted-foreground">x {item.quantity}</span></span>
                  <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2"><span>Total</span><span className="text-primary">₹{total.toLocaleString("en-IN")}</span></div>
          </div>
          <Button type="submit" form="checkout-form" className="w-full mt-4" size="lg" disabled={loading}>
            {loading ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN")}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}