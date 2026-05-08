import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const user = useSelector((s) => s.auth.user);

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
          <Card className="p-6 space-y-4">
            <div><Label>Name</Label><Input defaultValue={user.name} className="mt-1" /></div>
            <div><Label>Email</Label><Input defaultValue={user.email} className="mt-1" /></div>
            <div><Label>Phone</Label><Input defaultValue={user.phone || ""} className="mt-1" /></div>
            <Button>Save changes</Button>
          </Card>
        </TabsContent>
        <TabsContent value="addr">
          <Card className="p-6 text-sm text-muted-foreground">No saved addresses yet.</Card>
        </TabsContent>
        <TabsContent value="pw">
          <Card className="p-6 space-y-4">
            <div><Label>Current password</Label><Input type="password" className="mt-1" /></div>
            <div><Label>New password</Label><Input type="password" className="mt-1" /></div>
            <div><Label>Confirm new password</Label><Input type="password" className="mt-1" /></div>
            <Button>Update password</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
