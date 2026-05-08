// Mock book data
export const categories = [
  { id: "fiction", name: "Fiction", icon: "📖" },
  { id: "academic", name: "Academic", icon: "🎓" },
  { id: "self-help", name: "Self-Help", icon: "💡" },
  { id: "programming", name: "Programming", icon: "💻" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "history", name: "History", icon: "🏛️" },
  { id: "children", name: "Children", icon: "🧸" },
  { id: "regional", name: "Regional", icon: "🌏" },
];

const cover = (seed) =>
  `https://picsum.photos/seed/book-${seed}/400/600`;

export const books = [
  { id: "1", title: "The Midnight Library", author: "Matt Haig", category: "fiction", price: 299, mrp: 499, rating: 4.6, numReviews: 1240, stock: 12, language: "English", publisher: "Canongate", year: 2020, pages: 304, isbn: "9781786892737", featured: true, tags: ["bestseller", "philosophy"], description: "Between life and death there is a library, and within that library, the shelves go on forever." },
  { id: "2", title: "Atomic Habits", author: "James Clear", category: "self-help", price: 349, mrp: 699, rating: 4.8, numReviews: 5320, stock: 30, language: "English", publisher: "Random House", year: 2018, pages: 320, isbn: "9781847941831", featured: true, tags: ["bestseller", "productivity"], description: "Tiny changes, remarkable results. An easy and proven way to build good habits." },
  { id: "3", title: "Clean Code", author: "Robert C. Martin", category: "programming", price: 599, mrp: 899, rating: 4.7, numReviews: 980, stock: 8, language: "English", publisher: "Prentice Hall", year: 2008, pages: 464, isbn: "9780132350884", featured: true, tags: ["software", "classic"], description: "A handbook of agile software craftsmanship." },
  { id: "4", title: "Sapiens", author: "Yuval Noah Harari", category: "history", price: 399, mrp: 799, rating: 4.6, numReviews: 4210, stock: 20, language: "English", publisher: "Harper", year: 2014, pages: 464, isbn: "9780062316097", featured: true, tags: ["history", "anthropology"], description: "A brief history of humankind." },
  { id: "5", title: "A Brief History of Time", author: "Stephen Hawking", category: "science", price: 299, mrp: 499, rating: 4.5, numReviews: 2100, stock: 14, language: "English", publisher: "Bantam", year: 1988, pages: 256, isbn: "9780553380163", featured: false, tags: ["physics", "cosmos"], description: "From the Big Bang to black holes." },
  { id: "6", title: "The Pragmatic Programmer", author: "David Thomas", category: "programming", price: 549, mrp: 799, rating: 4.7, numReviews: 870, stock: 10, language: "English", publisher: "Addison-Wesley", year: 1999, pages: 352, isbn: "9780201616224", featured: false, tags: ["software"], description: "Your journey to mastery." },
  { id: "7", title: "1984", author: "George Orwell", category: "fiction", price: 199, mrp: 399, rating: 4.7, numReviews: 9800, stock: 50, language: "English", publisher: "Penguin", year: 1949, pages: 328, isbn: "9780451524935", featured: true, tags: ["classic", "dystopia"], description: "A dystopian social science fiction novel." },
  { id: "8", title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", category: "self-help", price: 279, mrp: 499, rating: 4.4, numReviews: 3400, stock: 25, language: "English", publisher: "HarperOne", year: 2016, pages: 224, isbn: "9780062457714", featured: false, tags: ["mindset"], description: "A counterintuitive approach to living a good life." },
  { id: "9", title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "academic", price: 199, mrp: 350, rating: 4.8, numReviews: 5600, stock: 40, language: "English", publisher: "Universities Press", year: 1999, pages: 180, isbn: "9788173711466", featured: true, tags: ["biography", "indian"], description: "An autobiography of A.P.J. Abdul Kalam." },
  { id: "10", title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "children", price: 449, mrp: 799, rating: 4.9, numReviews: 12000, stock: 35, language: "English", publisher: "Bloomsbury", year: 1997, pages: 336, isbn: "9780747532699", featured: true, tags: ["fantasy", "children"], description: "The first book in the Harry Potter series." },
  { id: "11", title: "Cosmos", author: "Carl Sagan", category: "science", price: 449, mrp: 699, rating: 4.7, numReviews: 1500, stock: 9, language: "English", publisher: "Random House", year: 1980, pages: 396, isbn: "9780345539434", featured: false, tags: ["astronomy"], description: "A personal voyage through the universe." },
  { id: "12", title: "Ikigai", author: "Hector Garcia", category: "self-help", price: 249, mrp: 399, rating: 4.5, numReviews: 4100, stock: 22, language: "English", publisher: "Penguin", year: 2017, pages: 208, isbn: "9780143130727", featured: false, tags: ["japanese", "lifestyle"], description: "The Japanese secret to a long and happy life." },
].map((b, i) => ({ ...b, coverImage: cover(b.id) }));

export const getBooks = ({ keyword = "", category = "", sort = "relevance", minPrice = 0, maxPrice = 10000 } = {}) => {
  let result = [...books];
  if (keyword) {
    const k = keyword.toLowerCase();
    result = result.filter(b => b.title.toLowerCase().includes(k) || b.author.toLowerCase().includes(k));
  }
  if (category) result = result.filter(b => b.category === category);
  result = result.filter(b => b.price >= minPrice && b.price <= maxPrice);
  switch (sort) {
    case "price_asc": result.sort((a, b) => a.price - b.price); break;
    case "price_desc": result.sort((a, b) => b.price - a.price); break;
    case "rating": result.sort((a, b) => b.rating - a.rating); break;
    case "newest": result.sort((a, b) => b.year - a.year); break;
    default: break;
  }
  return result;
};

export const getBookById = (id) => books.find(b => b.id === id);
export const getFeatured = () => books.filter(b => b.featured);
export const getNewArrivals = () => [...books].sort((a, b) => b.year - a.year).slice(0, 8);
export const getTopRated = () => [...books].sort((a, b) => b.rating - a.rating).slice(0, 8);
export const getRecommendations = (id) => {
  const book = getBookById(id);
  if (!book) return [];
  return books.filter(b => b.id !== id && (b.category === book.category || b.author === book.author)).slice(0, 6);
};
