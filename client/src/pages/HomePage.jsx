import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Truck, Tag, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import BookCard from "@/components/books/BookCard";
import { useFeaturedQuery, useNewArrivalsQuery, useTopRatedQuery } from "@/store/api/booksApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { useSubscribeMutation } from "@/store/api/newsletterApi";

function Section({ title, link, children }) {
  return (
    <section className="container mx-auto px-10 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        {link && <Link to={link} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-4 w-4" /></Link>}
      </div>
      {children}
    </section>
  );
}

function Skeleton() {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />)}</div>;
}

export default function HomePage() {
  const { data: featured, isLoading: fL } = useFeaturedQuery();
  const { data: newer, isLoading: nL } = useNewArrivalsQuery();
  const { data: top, isLoading: tL } = useTopRatedQuery();
  
  // Safely extract the arrays regardless of how the backend wraps the response
  const featuredBooks = Array.isArray(featured) ? featured : (featured?.books || featured?.data || []);
  const newArrivalsBooks = Array.isArray(newer) ? newer : (newer?.books || newer?.data || []);
  const topRatedBooks = Array.isArray(top) ? top : (top?.books || top?.data || []);

  const { data: categoriesData = [], isLoading: cL } = useGetCategoriesQuery();
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.categories || []);

  const [email, setEmail] = useState("");
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      await subscribe(email).unwrap();
      toast.success("Subscribed to newsletter successfully!");
      setEmail("");
    } catch (err) {
      toast.error(err.data?.message || "Failed to subscribe");
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-accent/30">
        <div className="container mx-auto px-8 py-16 md:py-24 grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">📚 1000+ titles in stock</span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              Discover Your<br /><span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Next Great Read</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">Thousands of books at affordable prices, delivered to your doorstep across India.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/books"><Button size="lg">Browse Books <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
              <Link to="/books"><Button size="lg" variant="outline">Explore Categories</Button></Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3">
            {featuredBooks.slice(0, 6).map((b, i) => (
              <img key={b._id || b.id} src={b.coverImage} alt={b.title} className={`rounded-lg shadow-xl ${i % 2 ? "translate-y-6" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <Section title="Shop by Category">
        {cL ? <Skeleton /> : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map(c => (
              <Link key={c.id} to={`/books?category=${c.id}`}>
                <Card className="flex flex-col items-center justify-center gap-2 p-4 transition hover:bg-accent hover:-translate-y-0.5 hover:shadow-md text-center">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-xs font-medium">{c.name}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Featured Books" link="/books">
        {fL ? <Skeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredBooks.slice(0, 4).map(b => <BookCard key={b._id || b.id} book={b} />)}
          </div>
        )}
      </Section>

      <Section title="New Arrivals" link="/books">
        {nL ? <Skeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivalsBooks.slice(0, 4).map(b => <BookCard key={b._id || b.id} book={b} />)}
          </div>
        )}
      </Section>

      <Section title="Top Rated" link="/books">
        {tL ? <Skeleton /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topRatedBooks.slice(0, 4).map(b => <BookCard key={b._id || b.id} book={b} />)}
          </div>
        )}
      </Section>

      {/* Why us */}
      <Section title="Why BookVista">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: BookOpen, title: "Wide Selection", desc: "1000+ titles across genres" },
            { icon: Truck, title: "Fast Delivery", desc: "Free shipping over ₹499" },
            { icon: Tag, title: "Best Prices", desc: "Up to 50% off everyday" },
            { icon: Shield, title: "Secure Payments", desc: "UPI, Cards & COD" },
          ].map((f) => (
            <Card key={f.title} className="p-6">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/10 to-accent/30">
          <h2 className="text-2xl md:text-3xl font-bold">Stay Updated</h2>
          <p className="mt-2 text-muted-foreground">Get book recommendations & exclusive deals in your inbox.</p>
          <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 rounded-md border bg-background px-4 py-2 text-sm" />
            <Button type="submit" disabled={isSubscribing}>{isSubscribing ? "Subscribing..." : "Subscribe"}</Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
