import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceDisplay from "@/components/common/PriceDisplay";
import StarRating from "@/components/common/StarRating";
import BookCard from "@/components/books/BookCard";
import { useGetBookQuery, useRecommendationsQuery } from "@/store/api/booksApi";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { toast } from "sonner";

export default function BookDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  
  const { data: book, isLoading, error } = useGetBookQuery(id);
  const { data: recs = [] } = useRecommendationsQuery(id, { skip: !book });

  const wished = useSelector((s) =>
    book ? s.wishlist.items.some(i => i.id === book.id) : false
  );

  if (isLoading) {
    return <div className="container mx-auto py-20 text-center text-muted-foreground">Loading book details...</div>;
  }

  if (error || !book) {
    return <div className="container mx-auto py-20 text-center text-red-500 font-bold">Book not found or failed to load.</div>;
  }

  const stockColor = book.stock === 0 ? "text-red-600" : book.stock < 5 ? "text-orange-600" : "text-emerald-600";
  const stockText = book.stock === 0 ? "Out of stock" : book.stock < 5 ? `Only ${book.stock} left!` : "In stock";

  const handleAddToCart = () => {
    dispatch(addToCart({ ...book, quantity: qty }));
    toast.success(`Added ${qty} ${qty > 1 ? 'items' : 'item'} to cart.`);
  };

  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(book));
    toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/books" className="text-primary hover:underline mb-8 inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Books
      </Link>
      
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        <Card className="p-6 md:p-10 flex justify-center sticky top-24">
          <img src={book.coverImage} alt={book.title} className="w-full max-w-sm rounded-md shadow-lg object-cover" />
        </Card>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg text-muted-foreground">by <span className="text-foreground font-medium">{book.author}</span></p>
          </div>
          <StarRating rating={book.rating} count={book.numReviews} />
          <PriceDisplay price={book.price} mrp={book.mrp} size="lg" />
          <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
          <p className={`font-semibold ${stockColor}`}>{stockText}</p>

          {book.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center rounded-md border">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setQty(q => Math.min(book.stock, q + 1))}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg" disabled={book.stock === 0} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" onClick={handleToggleWishlist}>
              <Heart className={`mr-2 h-4 w-4 transition-colors ${wished ? "fill-red-500 text-red-500" : ""}`} /> Wishlist
            </Button>
          </div>

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {book.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}

          <Tabs defaultValue="desc" className="pt-4">
            <TabsList>
              <TabsTrigger value="desc">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="text-sm leading-relaxed text-muted-foreground pt-2">{book.description}</TabsContent>
            <TabsContent value="details" className="pt-2">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Publisher</dt><dd>{book.publisher}</dd>
                <dt className="text-muted-foreground">Language</dt><dd>{book.language}</dd>
                <dt className="text-muted-foreground">Pages</dt><dd>{book.pages}</dd>
                <dt className="text-muted-foreground">ISBN</dt><dd>{book.isbn}</dd>
                <dt className="text-muted-foreground">Year</dt><dd>{book.year}</dd>
              </dl>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {recs.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {recs.slice(0, 5).map(b => <BookCard key={b.id || b._id} book={b} />)}
          </div>
        </section>
      )}
    </div>
  );
}
