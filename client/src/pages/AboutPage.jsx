import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold">About BookVista</h1>
      <p className="mt-4 text-lg text-muted-foreground">We're on a mission to bring great books to every reader in India — affordable, fast, and delightful.</p>
      <div className="grid gap-4 sm:grid-cols-3 mt-10">
        {[
          { v: "10K+", l: "Books" },
          { v: "50K+", l: "Happy Readers" },
          { v: "200+", l: "Cities Served" },
        ].map(s => (
          <Card key={s.l} className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
