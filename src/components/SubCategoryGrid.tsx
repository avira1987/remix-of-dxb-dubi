import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import productBag from "@/assets/product-bag.jpg";

// Import brand logos as fallback
import logoLV from "@/assets/logo-lv.png";
import logoGucci from "@/assets/logo-gucci.png";
import logoHermes from "@/assets/logo-hermes.png";
import logoPrada from "@/assets/logo-prada.png";
import logoDior from "@/assets/logo-dior.png";
import logoChanel from "@/assets/logo-chanel.png";
import logoVersace from "@/assets/logo-versace.png";

interface SubCategoryGridProps {
  selectedBrand: string;
  selectedCategory: string;
  onProductSelect: (product: string) => void;
  onBack: () => void;
}

interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  brand_id: string | null;
  category_id: string | null;
}

const fallbackBrandsList = [
  { id: "1", name: "Louis Vuitton", logo: logoLV },
  { id: "2", name: "Gucci", logo: logoGucci },
  { id: "3", name: "Hermès", logo: logoHermes },
  { id: "4", name: "Prada", logo: logoPrada },
  { id: "5", name: "Dior", logo: logoDior },
  { id: "6", name: "Chanel", logo: logoChanel },
  { id: "7", name: "Versace", logo: logoVersace },
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Popular", value: "popular" },
];

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under AED 5,000", value: "0-5000" },
  { label: "AED 5,000 - 10,000", value: "5000-10000" },
  { label: "AED 10,000 - 20,000", value: "10000-20000" },
  { label: "Over AED 20,000", value: "20000+" },
];

const SubCategoryGrid = ({
  selectedBrand,
  selectedCategory,
  onProductSelect,
  onBack,
}: SubCategoryGridProps) => {
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState("newest");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  
  // Data states
  const [brands, setBrands] = useState<Array<{ id: string; name: string; logo: string }>>([]);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    brand: string;
    brandId: string | null;
    category: string;
    price: number;
    image: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch brands
      const { data: brandsData } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true);

      if (brandsData && brandsData.length > 0) {
        const formattedBrands = brandsData.map((b, index) => ({
          id: b.id,
          name: b.name,
          logo: b.logo_url || fallbackBrandsList[index % fallbackBrandsList.length]?.logo || logoLV,
        }));
        setBrands(formattedBrands);
      } else {
        setBrands(fallbackBrandsList);
      }

      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Fetch categories for mapping
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name");

      const categoriesMap = new Map<string, string>();
      categoriesData?.forEach(c => categoriesMap.set(c.id, c.name));

      // Fetch brands for mapping
      const brandsMap = new Map<string, string>();
      brandsData?.forEach(b => brandsMap.set(b.id, b.name));

      if (productsData && productsData.length > 0) {
        const formattedProducts = productsData.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand_id ? (brandsMap.get(p.brand_id) || "Unknown") : "Unknown",
          brandId: p.brand_id,
          category: p.category_id ? (categoriesMap.get(p.category_id) || "Unknown") : "Unknown",
          price: p.price,
          image: p.image_url || productBag,
        }));
        setProducts(formattedProducts);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const displayBrands = brands.length > 0 ? brands : fallbackBrandsList;

  // Filter products based on search query, brand filter, and price
  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = !selectedBrandFilter || 
      product.brand === selectedBrandFilter;
    
    let matchesPrice = true;
    if (selectedPriceRange !== "all") {
      if (selectedPriceRange === "0-5000") matchesPrice = product.price < 5000;
      else if (selectedPriceRange === "5000-10000") matchesPrice = product.price >= 5000 && product.price <= 10000;
      else if (selectedPriceRange === "10000-20000") matchesPrice = product.price >= 10000 && product.price <= 20000;
      else if (selectedPriceRange === "20000+") matchesPrice = product.price > 20000;
    }

    return matchesSearch && matchesBrand && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === "price-asc") return a.price - b.price;
    if (selectedSort === "price-desc") return b.price - a.price;
    return 0;
  });

  const activeFiltersCount = [
    selectedPriceRange !== "all",
    selectedBrandFilter !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedPriceRange("all");
    setSearchQuery("");
    setSelectedBrandFilter("");
  };

  const formatPrice = (price: number) => {
    return `AED ${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="font-display text-sm tracking-[0.3em] text-gradient-gold">
              {selectedBrand}
            </p>
            <p className="font-body text-xs tracking-[0.2em] text-muted-foreground mt-0.5">
              {selectedCategory}
            </p>
          </div>
          <div className="w-5" />
        </div>
      </motion.header>

      <div className="pt-24 pb-8 px-4">
        {/* Brands Selection - Animated Circular */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <p className="font-body text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3 text-center">
            Filter by Brand
          </p>
          
          {/* All Brands Button */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setSelectedBrandFilter("")}
              className={`px-4 py-2 rounded-full font-body text-xs transition-colors ${
                selectedBrandFilter === ""
                  ? "bg-primary text-primary-foreground"
                  : "bg-noir-elevated text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              All Brands
            </button>
          </div>

          {/* Animated Brand Circles */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{
                x: [0, -100 * displayBrands.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 15,
                  ease: "linear",
                },
              }}
            >
              {[...displayBrands, ...displayBrands].map((brand, index) => (
                <button
                  key={`${brand.id}-${index}`}
                  onClick={() => setSelectedBrandFilter(brand.name)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all duration-300 ${
                    selectedBrandFilter === brand.name ? "scale-110" : ""
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-2 transition-all duration-300 ${
                      selectedBrandFilter === brand.name
                        ? "bg-primary/20 border-2 border-primary ring-2 ring-primary/30"
                        : "bg-noir-elevated border border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain filter invert"
                    />
                  </div>
                  <span
                    className={`font-body text-[10px] text-center max-w-16 truncate ${
                      selectedBrandFilter === brand.name
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {brand.name}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="glass-card rounded-sm p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-noir-elevated border border-border rounded-sm py-3 pl-10 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Active Filters Tags */}
        {(searchQuery || selectedBrandFilter) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-sm text-xs text-foreground">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrandFilter && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-sm text-xs text-foreground">
                Brand: {selectedBrandFilter}
                <button onClick={() => setSelectedBrandFilter("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary/80"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Filter Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 glass-card rounded-sm hover:border-primary/50 transition-colors ${showFilters ? 'border-primary/50' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            <span className="font-body text-sm text-foreground">More Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-body text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-4"
            >
              <div className="glass-card rounded-sm p-4 space-y-5">
                {/* Sort */}
                <div>
                  <h4 className="font-body text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                    Sort By
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedSort(option.value)}
                        className={`px-3 py-1.5 rounded-sm font-body text-xs transition-colors ${
                          selectedSort === option.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-noir-elevated text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-body text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">
                    Price Range
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setSelectedPriceRange(range.value)}
                        className={`px-3 py-1.5 rounded-sm font-body text-xs transition-colors ${
                          selectedPriceRange === range.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-noir-elevated text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="divider-gold mb-6" />

        {/* Product Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase">
              {sortedProducts.length} Products
            </h3>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="product-card animate-pulse">
                  <div className="aspect-square bg-muted/20" />
                  <div className="p-3">
                    <div className="h-4 bg-muted/20 rounded mb-2" />
                    <div className="h-4 bg-muted/20 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {sortedProducts.map((product, index) => (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => onProductSelect(product.id)}
                  className="product-card text-left"
                >
                  {/* Image */}
                  <div className="aspect-square overflow-hidden bg-noir-elevated">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details - Only Brand and Price */}
                  <div className="p-3">
                    <p className="font-display text-sm text-foreground line-clamp-1">
                      {product.brand}
                    </p>
                    <p className="font-body text-sm text-primary mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="font-body text-muted-foreground">No products found</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:text-primary/80 font-body text-sm"
              >
                Clear filters
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubCategoryGrid;
