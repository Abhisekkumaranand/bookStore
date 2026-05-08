import { Star } from "lucide-react";

export default function StarRating({ rating = 0, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white">
        {rating.toFixed(1)} <Star size={size - 4} fill="currentColor" />
      </span>
      {count != null && <span className="text-xs text-muted-foreground">({count.toLocaleString("en-IN")})</span>}
    </div>
  );
}
