import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubmitContactFormMutation } from "@/store/api/contactApi";
import { useState } from "react";

export default function ContactPage() {
  const [submitContact, { isLoading }] = useSubmitContactFormMutation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitContact(form).unwrap();
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-2 text-muted-foreground">We'd love to hear from you.</p>
      <Card className="p-6 mt-8">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div><Label>Name</Label><Input required className="mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><Label>Email</Label><Input type="email" required className="mt-1" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><Label>Subject</Label><Input required className="mt-1" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
          <div><Label>Message</Label><Textarea required rows={5} className="mt-1" value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
