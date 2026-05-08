import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCard from "@/components/books/BookCard";

export default function WishlistPage() {
  const items = useSelector((s) => s.wishlist.items);
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your wishlist is empty</h2>
        <p className="mt-2 text-muted-foreground">Save books you love for later.</p>
        <Link to="/books"><Button className="mt-6">Browse Books</Button></Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(b => {
          // Normalize the item in case it's a backend wrapper or uses _id
          const bookData = b.book && typeof b.book === 'object' ? b.book : b;
          const normalizedBook = {
            ...b,
            ...bookData,
            id: bookData.id || bookData._id || b.id || b._id,
          };
          return <BookCard key={normalizedBook.id} book={normalizedBook} />;
        })}
      </div>
    </div>
  );
}
