import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import BookCard from "@/components/books/BookCard";
import { useListBooksQuery } from "@/store/api/booksApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

function Filters({ search, update }) {
  const [price, setPrice] = useState([search.minPrice ?? 0, search.maxPrice ?? 1000]);
  const { data } = useGetCategoriesQuery();
  
  // Safely fallback to an empty array if the API doesn't return a valid array
  const categories = Array.isArray(data) ? data : (data?.categories || []);

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Category</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="cat-all" checked={!search.category} onCheckedChange={() => update({ category: undefined })} />
            <Label htmlFor="cat-all" className="font-normal cursor-pointer">All</Label>
          </div>
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-2">
              <Checkbox id={`cat-${c.id}`} checked={search.category === c.id} onCheckedChange={() => update({ category: c.id })} />
              <Label htmlFor={`cat-${c.id}`} className="font-normal cursor-pointer">{c.icon} {c.name}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Price: ₹{price[0]} – ₹{price[1]}</h4>
        <Slider min={0} max={1000} step={50} value={price} onValueChange={setPrice} onValueCommit={(v) => update({ minPrice: v[0], maxPrice: v[1] })} />
      </div>
      <Button variant="outline" className="w-full" onClick={() => update({ category: undefined, minPrice: undefined, maxPrice: undefined, keyword: undefined })}>
        <X className="h-4 w-4 mr-1" /> Clear filters
      </Button>
    </div>
  );
}

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = {
    keyword: searchParams.get("keyword") || undefined,
    sort: searchParams.get("sort") || undefined,
    category: searchParams.get("category") || undefined,
    minPrice: searchParams.get("minPrice") && !isNaN(searchParams.get("minPrice")) ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") && !isNaN(searchParams.get("maxPrice")) ? Number(searchParams.get("maxPrice")) : undefined,
  };

  const update = (patch) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") newParams.delete(key);
      else newParams.set(key, value);
    });
    setSearchParams(newParams);
  };
  const { data, isLoading } = useListBooksQuery(search);
  
  // Safely fallback depending on whether backend returns the array directly or an object wrapper
  const books = Array.isArray(data) ? data : (data?.books || data?.data || []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Books</h1>
          <p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `Showing ${books.length} books`}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search..."
            defaultValue={search.keyword || ""}
            onKeyDown={(e) => { if (e.key === "Enter") update({ keyword: e.currentTarget.value }); }}
            className="w-40 sm:w-56"
          />
          <Select value={search.sort || "relevance"} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden"><Filter className="h-4 w-4" /></Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-4"><Filters search={search} update={update} /></div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <Card className="p-5 sticky top-20"><Filters search={search} update={update} /></Card>
        </aside>
        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : books.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No books found.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map(b => <BookCard key={b._id || b.id} book={b} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
