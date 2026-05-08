import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BookOpen, Heart, Menu, Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/common/ThemeToggle";
import { selectCartCount } from "@/store/slices/cartSlice";
import { logout } from "@/store/slices/authSlice";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector((s) => s.wishlist.items.length);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/books?keyword=${encodeURIComponent(q)}`);
    } else {
      navigate("/books");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader><SheetTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> BookVista</SheetTitle></SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">{l.label}</Link>
              ))}
              <Link to="/wishlist" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Wishlist</Link>
              <Link to="/cart" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Cart</Link>
              {user ? (
                <Link to="/profile" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Profile</Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Login</Link>
                  <Link to="/register" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Register</Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">BookVista</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(l => (
            <NavLink 
              key={l.to} 
              to={l.to} 
              end={l.to === "/"} 
              className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium hover:bg-accent ${isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books, authors..." className="pl-9" />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs">{wishCount}</Badge>}
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs">{cartCount}</Badge>}
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/wishlist">Wishlist</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => dispatch(logout())}><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hidden sm:block"><Button size="sm">Login</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}
