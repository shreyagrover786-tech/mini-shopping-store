import { useEffect, useMemo, useState } from "react";

const API_URL = "https://fakestoreapi.com/products";

// Select exactly 8 products from the API
const PRODUCT_IDS = [1, 3, 5, 7, 9, 12, 15, 18];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch and display only 8 sample products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        const selectedProducts = data.filter((product) =>
          PRODUCT_IDS.includes(product.id)
        );

        setProducts(selectedProducts);
      } catch {
        setError(
          "We couldn't load the products. Please check your internet connection and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Get categories from the selected products
  const categories = useMemo(
    () => [
      "All",
      ...new Set(products.map((product) => product.category)),
    ],
    [products]
  );

  // Search, filter, and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortOrder === "low-high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "high-low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOrder === "rating") {
      result = [...result].sort(
        (a, b) => b.rating.rate - a.rating.rate
      );
    }

    return result;
  }, [products, search, selectedCategory, sortOrder]);

  // Calculate cart count and total
  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Add product to cart
  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  // Increase or decrease quantity
  function changeQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove one item from cart
  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }

  // Clear entire cart
  function clearCart() {
    setCart([]);
  }

  function scrollToProducts() {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
    });
    setMobileMenuOpen(false);
  }

  function scrollToCart() {
    document.getElementById("cart")?.scrollIntoView({
      behavior: "smooth",
    });
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#home" className="flex shrink-0 items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold text-white shadow-md shadow-blue-200">
              S
            </span>

            <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Shop<span className="text-blue-600">Ease</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Home
            </a>

            <button
              onClick={scrollToProducts}
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Shop
            </button>

            <button
              onClick={scrollToCart}
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Your Cart
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToCart}
              aria-label={`Open cart, ${cartCount} items`}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 sm:px-4"
            >
              <span aria-hidden="true">🛒</span>
              <span className="hidden sm:inline">Cart</span>

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold text-blue-700">
                {cartCount}
              </span>
            </button>

            <button
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-slate-700 md:hidden"
            >
              ☰
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-semibold">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>

              <button
                onClick={scrollToProducts}
                className="text-left"
              >
                Shop Products
              </button>

              <button
                onClick={scrollToCart}
                className="text-left"
              >
                Your Cart
              </button>
            </div>
          </div>
        )}
      </header>

      <main
        id="home"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Hero banner */}
        <section className="py-7 sm:py-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-10 text-white shadow-xl shadow-blue-100 sm:px-10 sm:py-14 lg:px-16">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                Your everyday shopping destination
              </span>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Find your next
                <br />
                <span className="text-blue-100">
                  favorite thing.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-blue-50 sm:text-base">
                Discover great finds across fashion, electronics,
                and more. Simple shopping starts here.
              </p>

              <button
                onClick={scrollToProducts}
                className="mt-7 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Explore Products →
              </button>
            </div>

            <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full border-[35px] border-white/10 sm:right-10 sm:top-0" />

            <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="pointer-events-none absolute bottom-8 right-12 hidden rotate-6 text-8xl drop-shadow-lg lg:block">
              🛍️
            </div>
          </div>
        </section>

        {/* Store highlights */}
        <section className="grid grid-cols-1 gap-3 pb-8 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🚚
            </span>
            <div>
              <p className="font-bold text-slate-900">Easy browsing</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Find products in seconds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🔎
            </span>
            <div>
              <p className="font-bold text-slate-900">Smart search</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Search and sort your finds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🛒
            </span>
            <div>
              <p className="font-bold text-slate-900">Simple cart</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage your items easily
              </p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="scroll-mt-28 pb-14">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Curated for you
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Explore our products
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Find something you'll love.
              </p>
            </div>

            <span className="text-sm font-medium text-slate-500">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} products found`}
            </span>
          </div>

          {/* Search and sort */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products by name..."
                aria-label="Search products"
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort products"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="default">Sort: Recommended</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Category filters */}
          <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-bold capitalize transition ${
                  selectedCategory === category
                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product grid and cart */}
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="h-40 rounded-xl bg-slate-100 sm:h-52" />
                      <div className="mt-4 h-4 rounded bg-slate-100" />
                      <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
                      <div className="mt-5 h-10 rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                  <p className="text-3xl">⚠️</p>
                  <p className="mt-3 font-bold text-slate-900">
                    Something went wrong
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
                  <p className="text-4xl">🔍</p>
                  <h3 className="mt-4 font-bold text-slate-900">
                    No products found
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try another search or choose a different category.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("All");
                    }}
                    className="mt-5 font-bold text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const inCart = cart.some(
                      (item) => item.id === product.id
                    );

                    return (
                      <article
                        key={product.id}
                        className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
                      >
                        <div className="relative flex h-48 items-center justify-center bg-white p-5 sm:h-60 sm:p-7">
                          <span className="absolute left-3 top-3 z-10 max-w-[85%] truncate rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-700 sm:text-xs">
                            {product.category}
                          </span>

                          <img
                            src={product.image}
                            alt={product.title}
                            loading="lazy"
                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex flex-1 flex-col border-t border-slate-100 p-3 sm:p-4">
                          <div className="flex items-center gap-1 text-xs text-amber-500">
                            <span aria-hidden="true">★</span>
                            <span className="font-bold text-slate-700">
                              {product.rating.rate}
                            </span>
                            <span className="truncate text-slate-400">
                              ({product.rating.count})
                            </span>
                          </div>

                          <h3
                            title={product.title}
                            className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-800 sm:min-h-12 sm:text-base sm:leading-6"
                          >
                            {product.title}
                          </h3>

                          <div className="mt-3">
                            <span className="text-base font-extrabold text-slate-900 sm:text-lg">
                              {formatPrice(product.price)}
                            </span>
                          </div>

                          <button
                            onClick={() => addToCart(product)}
                            className={`mt-4 w-full rounded-xl px-2 py-2.5 text-xs font-extrabold transition sm:text-sm ${
                              inCart
                                ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                : "bg-blue-600 text-white shadow-sm shadow-blue-100 hover:bg-blue-700 active:scale-[0.98]"
                            }`}
                          >
                            {inCart ? "＋ Add Another" : "＋ Add to Cart"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart panel */}
            <aside id="cart" className="scroll-mt-28 lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between bg-slate-900 px-5 py-5 text-white">
                  <div>
                    <h2 className="text-lg font-extrabold">Your Cart</h2>
                    <p className="mt-1 text-xs text-slate-300">
                      {cartCount} {cartCount === 1 ? "item selected" : "items selected"}
                    </p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">🛒</span>
                </div>

                {cart.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
                      🛍️
                    </div>
                    <h3 className="mt-4 font-bold text-slate-800">
                      Your cart is empty
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Explore our products and add your favorites here.
                    </p>
                    <button
                      onClick={scrollToProducts}
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto px-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 py-4">
                          <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 p-2">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-800">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm font-extrabold text-blue-700">
                              {formatPrice(item.price * item.quantity)}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div className="flex items-center rounded-lg border border-slate-200">
                                <button
                                  onClick={() => changeQuantity(item.id, -1)}
                                  aria-label={`Decrease quantity of ${item.title}`}
                                  className="px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-100"
                                >
                                  −
                                </button>
                                <span className="min-w-7 text-center text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => changeQuantity(item.id, 1)}
                                  aria-label={`Increase quantity of ${item.title}`}
                                  className="px-2.5 py-1.5 font-bold text-slate-600 hover:bg-slate-100"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs font-semibold text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-extrabold text-slate-900">
                          Total
                        </span>
                        <span className="text-xl font-extrabold text-blue-700">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Demo store: no payment is collected.
                      </p>
                      <button
                        onClick={clearCart}
                        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-7 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <a href="#home" className="text-lg font-extrabold text-slate-900">
            Shop<span className="text-blue-600">Ease</span>
          </a>

          <p className="text-xs text-slate-500">
            A front-end shopping demo built with React and Tailwind CSS.
          </p>

          <a href="#home" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;