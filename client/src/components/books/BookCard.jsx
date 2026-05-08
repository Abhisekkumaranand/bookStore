import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PriceDisplay from "@/components/common/PriceDisplay";
import StarRating from "@/components/common/StarRating";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { toast } from "sonner";

export default function BookCard({ book }) {
  const dispatch = useDispatch();
  const wished = useSelector((s) => s.wishlist.items.some((i) => i.id === book.id));
  const discount = book.mrp > book.price ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : 0;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col ">
      <Link to={`/books/${book.id}`} className="relative block h-48 sm:h-60 w-full shrink-0 overflow-hidden bg-muted">
        <img src={book.coverImage} alt={book.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        {discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-600 hover:bg-red-600 text-white text-[10px] px-1.5 py-0">{discount}% OFF</Badge>
        )}
        {book.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-semibold">Out of Stock</div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); dispatch(toggleWishlist(book)); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
          className="absolute top-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          aria-label="Toggle wishlist"
        >
          <Heart size={14} className={wished ? "fill-red-500 text-red-500" : "text-foreground"} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link to={`/books/${book.id}`} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-primary">
          {book.title}
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
        <StarRating rating={book.rating} count={book.numReviews} />
        <PriceDisplay price={book.price} mrp={book.mrp} />
        <Button
          size="sm"
          className="mt-auto"
          disabled={book.stock === 0}
          onClick={() => { dispatch(addToCart(book)); toast.success("Added to cart"); }}
        >
          <ShoppingCart className="mr-1 h-4 w-4" /> Add to Cart
        </Button>
      </div>
    </Card>
  );
}
