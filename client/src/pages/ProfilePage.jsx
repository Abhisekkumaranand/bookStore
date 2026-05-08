import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loginSuccess } from "@/store/slices/authSlice";

export default function ProfilePage() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e) => {
    if (e) e.preventDefault();
    console.log("Submitting profile update:", profileForm);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      console.log("Profile update response:", data);
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      dispatch(loginSuccess(data.user));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.message);
    }
  };

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault();
    console.log("Submitting password update...");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      console.log("Password update response:", data);
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      toast.success("Password updated successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err);
      toast.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
        <Link to="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">My Account</h1>
        {user?.role === "admin" && (
          <Link to="/admin">
            <Button variant="default">Go to Admin Dashboard</Button>
          </Link>
        )}
      </div>
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex">
          <TabsTrigger value="info">Profile</TabsTrigger>
          <TabsTrigger value="addr">Addresses</TabsTrigger>
          <TabsTrigger value="pw">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card className="p-6">
            <form className="space-y-4">
              <div><Label>Name</Label><Input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="mt-1" /></div>
              <div><Label>Email</Label><Input value={user.email || ""} disabled className="mt-1 text-muted-foreground" /></div>
              <div><Label>Phone</Label><Input value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="mt-1" /></div>
              <Button type="button" onClick={handleProfileUpdate}>Save changes</Button>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="addr">
          <Card className="p-6 text-sm text-muted-foreground">No saved addresses yet.</Card>
        </TabsContent>
        <TabsContent value="pw">
          <Card className="p-6">
            <form className="space-y-4">
              <div><Label>Current password</Label><Input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} className="mt-1" /></div>
              <div><Label>New password</Label><Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} className="mt-1" /></div>
              <div><Label>Confirm new password</Label><Input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} className="mt-1" /></div>
              <Button type="button" onClick={handlePasswordUpdate}>Update password</Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
