import { Link } from "react-router-dom";
import { useState } from "react";
import { BookOpen, Facebook, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="h-6 w-6 text-primary" /> BookVista
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">Your destination for books across every genre — delivered fast, priced right.</p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary" /></a>
            <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li><Link to="/books" className="hover:text-foreground">Books</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>FAQ</li><li>Shipping</li><li>Returns</li><li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@bookvista.com</li>
            <li>+91 98765 43210</li>
            <li>Mumbai, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 BookVista. All rights reserved.</div>
    </footer>
  );
}
