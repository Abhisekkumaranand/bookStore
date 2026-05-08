import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { loginSuccess } from "@/store/slices/authSlice";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const strength = form.password.length < 8 ? "weak" : form.password.length < 12 ? "medium" : "strong";
  const strengthColor = { weak: "bg-red-500", medium: "bg-yellow-500", strong: "bg-emerald-500" }[strength];

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Passwords don't match");
    if (form.password.length < 8) return toast.error("Password must be 8+ chars");
    if (!/^\d{10}$/.test(form.phone)) return toast.error("Phone must be 10 digits");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensures auth cookies are saved by the browser
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      dispatch(loginSuccess(data.user || data));
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="p-6 md:p-8">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join BookVista today</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Full Name</Label><Input required value={form.name} onChange={set("name")} className="mt-1" /></div>
          <div><Label>Email</Label><Input type="email" required value={form.email} onChange={set("email")} className="mt-1" /></div>
          <div><Label>Phone</Label><Input type="tel" required value={form.phone} onChange={set("phone")} placeholder="10-digit number" className="mt-1" /></div>
          <div>
            <Label>Password</Label>
            <Input type="password" required value={form.password} onChange={set("password")} className="mt-1" />
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 rounded bg-muted overflow-hidden"><div className={`h-full ${strengthColor}`} style={{ width: strength === "weak" ? "33%" : strength === "medium" ? "66%" : "100%" }} /></div>
                <span className="text-xs capitalize text-muted-foreground">{strength}</span>
              </div>
            )}
          </div>
          <div><Label>Confirm Password</Label><Input type="password" required value={form.confirm} onChange={set("confirm")} className="mt-1" /></div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
