export default function PriceDisplay({ price, mrp, size = "md" }) {
  const cls = size === "lg" ? "text-2xl" : "text-base";
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-foreground ${cls}`}>₹{price.toLocaleString("en-IN")}</span>
      {mrp && mrp > price && (
        <>
          <span className="text-sm text-muted-foreground line-through">₹{mrp.toLocaleString("en-IN")}</span>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{discount}% off</span>
        </>
      )}
    </div>
  );
}
