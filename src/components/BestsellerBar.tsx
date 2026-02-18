import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// Import fallback product images
import bagImage from "@/assets/bestseller-bag.jpg";
import watchImage from "@/assets/bestseller-watch.jpg";
import scarfImage from "@/assets/bestseller-scarf.jpg";
import sunglassesImage from "@/assets/bestseller-sunglasses.jpg";
import walletImage from "@/assets/bestseller-wallet.jpg";
import ringImage from "@/assets/bestseller-ring.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
  brand_id: string | null;
}

interface Brand {
  id: string;
  name: string;
}

// Sample bestseller products as fallback
const fallbackBestsellers = [
  { id: "1", name: "Classic Leather Bag", brand: "Louis Vuitton", price: 2450, image: bagImage },
  { id: "2", name: "Signature Watch", brand: "Rolex", price: 8900, image: watchImage },
  { id: "3", name: "Silk Scarf", brand: "Hermès", price: 580, image: scarfImage },
  { id: "4", name: "Designer Sunglasses", brand: "Gucci", price: 420, image: sunglassesImage },
  { id: "5", name: "Leather Wallet", brand: "Prada", price: 650, image: walletImage },
  { id: "6", name: "Diamond Ring", brand: "Cartier", price: 12500, image: ringImage },
];

// Fallback images when product has no image_url - use different ones per product
const fallbackImages = [bagImage, watchImage, scarfImage, sunglassesImage, walletImage, ringImage];

const BestsellerBar = () => {
  const [bestsellers, setBestsellers] = useState<Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      // Fetch bestseller products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_bestseller", true)
        .eq("is_active", true)
        .limit(10);

      if (productsError || !products || products.length === 0) {
        setBestsellers(fallbackBestsellers);
        setLoading(false);
        return;
      }

      // Fetch brands
      const brandIds = products.map(p => p.brand_id).filter(Boolean);
      const { data: brands } = await supabase
        .from("brands")
        .select("id, name")
        .in("id", brandIds);

      const brandsMap = new Map<string, string>();
      brands?.forEach(b => brandsMap.set(b.id, b.name));

      const formattedProducts = products.map((product, index) => {
        const productImage = product.image_url 
          || (product.images && product.images[0]) 
          || fallbackImages[index % fallbackImages.length];
        return {
          id: product.id,
          name: product.name,
          brand: product.brand_id ? (brandsMap.get(product.brand_id) || "Unknown") : "Unknown",
          price: product.price,
          image: productImage,
        };
      });

      setBestsellers(formattedProducts);
      setLoading(false);
    };

    fetchBestsellers();
  }, []);

  const displayItems = bestsellers.length > 0 ? bestsellers : fallbackBestsellers;
  // Duplicate items for seamless infinite scroll
  const duplicatedItems = [...displayItems, ...displayItems];

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden py-4">
        <p className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase text-center mb-3">
          Bestsellers
        </p>
        <div className="flex gap-4 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 glass-card rounded-lg p-3 animate-pulse">
              <div className="w-full h-32 rounded-lg bg-muted/20 mb-3" />
              <div className="h-3 bg-muted/20 rounded mb-2" />
              <div className="h-4 bg-muted/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden py-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase text-center mb-3"
      >
        Bestsellers
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.15 }}
        className="relative"
      >
        <motion.div
          className="flex gap-4 px-4"
          animate={{
            x: [0, -180 * displayItems.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
        >
          {duplicatedItems.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="flex-shrink-0 w-40 glass-card rounded-lg p-3 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
            >
              {/* Product Image */}
              <div className="w-full h-32 rounded-lg overflow-hidden bg-card/50 mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Product Info */}
              <div className="text-center">
                <p className="font-body text-xs text-muted-foreground truncate">
                  {product.brand}
                </p>
                <p className="font-display text-sm text-foreground truncate">
                  {product.name}
                </p>
                <p className="font-body text-sm text-primary mt-1 font-medium">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BestsellerBar;
