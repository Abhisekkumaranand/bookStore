import { Link } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="p-6 md:p-8">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground mt-1">We'll email you a reset link.</p>
        {sent ? (
          <p className="mt-6 rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">Reset link sent! Check your email.</p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Email sent"); }}>
            <div><Label>Email</Label><Input type="email" required className="mt-1" /></div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/login" className="text-primary hover:underline">Back to login</Link></p>
      </Card>
    </div>
  );
}