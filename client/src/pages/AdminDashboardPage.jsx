import { useState } from "react";
import { useGetDashboardStatsQuery } from "@/store/api/adminApi";
import { useListBooksQuery } from "@/store/api/booksApi";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, ShoppingBag, IndianRupee, Plus, Edit, Trash2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function BookForm({ book, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(book || {
    title: "", author: "", price: "", mrp: "", stock: "", category: "", description: "", coverImage: "", publisher: "", language: "", pages: "", isbn: "", year: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = book 
        ? `http://localhost:5000/api/books/${book._id || book.id}` 
        : `http://localhost:5000/api/books`;
      const method = book ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensures admin auth cookies are sent
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save book");
      
      toast.success(book ? "Book updated successfully!" : "Book created successfully!");
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 relative">
      <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
      <h2 className="text-xl font-bold mb-6">{book ? "Edit Book" : "Add New Book"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Title</Label><Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div><Label>Author</Label><Input required value={form.author} onChange={e => setForm({...form, author: e.target.value})} /></div>
          <div><Label>Price (₹)</Label><Input type="number" required value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} /></div>
          <div><Label>MRP (₹)</Label><Input type="number" value={form.mrp || ""} onChange={e => setForm({...form, mrp: Number(e.target.value)})} /></div>
          <div><Label>Stock</Label><Input type="number" required value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} /></div>
          <div><Label>Category ID</Label><Input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
          <div className="md:col-span-2"><Label>Cover Image URL</Label><Input required value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Book"}</Button>
        </div>
      </form>
    </Card>
  );
}

function BooksManager() {
  const { data, isLoading, refetch } = useListBooksQuery({ limit: 100 });
  const books = Array.isArray(data) ? data : (data?.books || data?.data || []);
  const [editingBook, setEditingBook] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/books/${id}`, {
          method: "DELETE",
          credentials: "include"
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to delete book");
        
        toast.success("Book deleted successfully!");
        refetch();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground border rounded-lg">Loading books...</div>;

  if (isAdding || editingBook) {
    return (
      <BookForm 
        book={editingBook} 
        onClose={() => { setIsAdding(false); setEditingBook(null); }} 
        onSuccess={() => { setIsAdding(false); setEditingBook(null); refetch(); }} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Books</h2>
        <Button onClick={() => setIsAdding(true)}><Plus className="h-4 w-4 mr-2" /> Add Book</Button>
      </div>
      <div className="grid gap-4">
        {books.map(book => (
          <Card key={book._id || book.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
              <div>
                <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                <div className="text-sm mt-1">
                  <span className="font-medium text-primary">₹{book.price}</span>
                  <span className="ml-4 text-muted-foreground">Stock: {book.stock}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingBook(book)}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(book._id || book.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </Card>
        ))}
        {books.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border rounded-lg">No books found. Add some!</div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground mt-20">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 mt-20">Failed to load dashboard statistics.</div>;
  }

  const { stats, lowStockBooks, recentOrders } = data || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="books">Manage Books</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
            <h3 className="text-2xl font-bold">{stats?.totalUsers || 0}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Books</p>
            <h3 className="text-2xl font-bold">{stats?.totalBooks || 0}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold">{stats?.totalOrders || 0}</h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString("en-IN") || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Low Stock Books</h2>
          <ul className="space-y-3">
            {lowStockBooks?.length > 0 ? lowStockBooks.map((book) => (
              <li key={book._id} className="flex justify-between items-center text-sm">
                <span className="font-medium line-clamp-1">{book.title}</span>
                <span className="text-red-600 font-bold whitespace-nowrap ml-4">{book.stock} left</span>
              </li>
            )) : <p className="text-muted-foreground text-sm">All books are adequately stocked.</p>}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Recent Orders</h2>
          <ul className="space-y-3">
            {recentOrders?.length > 0 ? recentOrders.map((order) => (
              <li key={order._id} className="flex justify-between items-center text-sm">
                <span className="font-medium line-clamp-1">{order.user?.name || "Guest User"}</span>
                <span className="text-green-600 font-bold whitespace-nowrap ml-4">₹{order.total?.toLocaleString("en-IN")}</span>
              </li>
            )) : <p className="text-muted-foreground text-sm">No recent orders found.</p>}
          </ul>
        </Card>
      </div>
        </TabsContent>
        
        <TabsContent value="books">
          <BooksManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}