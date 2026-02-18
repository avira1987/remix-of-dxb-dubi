import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Instagram, Camera, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import productBag from "@/assets/product-bag.jpg";

interface ProductShowcaseProps {
  selectedBrand: string;
  productId: string;
  onBack: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
  brand_id: string | null;
  description: string | null;
}

const ProductShowcase = ({ selectedBrand, productId, onBack }: ProductShowcaseProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<{
    name: string;
    brand: string;
    price: string;
    images: string[];
    description: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error || !productData) {
        // Fallback product
        setProduct({
          name: "Executive Tote",
          brand: selectedBrand || "Louis Vuitton",
          price: "AED 12,500",
          images: [productBag, productBag, productBag],
          description: null,
        });
        setLoading(false);
        return;
      }

      // Fetch brand name
      let brandName = selectedBrand || "Unknown";
      if (productData.brand_id) {
        const { data: brandData } = await supabase
          .from("brands")
          .select("name")
          .eq("id", productData.brand_id)
          .maybeSingle();
        if (brandData) {
          brandName = brandData.name;
        }
      }

      // Prepare images array
      const images: string[] = [];
      if (productData.image_url) {
        images.push(productData.image_url);
      }
      if (productData.images && productData.images.length > 0) {
        images.push(...productData.images);
      }
      if (images.length === 0) {
        images.push(productBag);
      }

      setProduct({
        name: productData.name,
        brand: brandName,
        price: `AED ${productData.price.toLocaleString()}`,
        images,
        description: productData.description,
      });
      setLoading(false);
    };

    fetchProduct();
  }, [productId, selectedBrand]);

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Product not found</div>
      </div>
    );
  }

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
              {product.brand}
            </p>
          </div>
          <div className="w-5" />
        </div>
      </motion.header>

      <div className="pt-20">
        {/* Hero Image Carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square bg-gradient-radial"
        >
          {/* Image */}
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-contain p-8"
          />
          
          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-card flex items-center justify-center hover:border-primary/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex 
                      ? "bg-primary" 
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-6 right-6 glass-card px-3 py-1.5 rounded-full"
          >
            <span className="font-body text-xs tracking-wider text-primary">
              EXCLUSIVE
            </span>
          </motion.div>
        </motion.div>

        {/* Product Info & Order Section */}
        <div className="px-6 py-8 space-y-6">
          {/* Title & Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 className="font-display text-2xl text-foreground">
              {product.brand}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {product.name}
            </p>
            <p className="font-display text-xl text-primary mt-2">
              {product.price}
            </p>
          </motion.div>

          <div className="divider-gold" />

          {/* Order Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-sm p-6"
          >
            <h3 className="font-display text-lg text-center text-foreground mb-6">
              How to Order
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <p className="font-body text-sm text-foreground/80">
                  Screenshot this product
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <p className="font-body text-sm text-foreground/80">
                  Send via WhatsApp or Instagram
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <p className="font-body text-sm text-foreground/80">
                  Complete your order!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/97144447777?text=Hello! I'm interested in this product"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-luxury flex items-center justify-center gap-3 bg-[#25D366]/10 border-[#25D366]/30 hover:border-[#25D366]/60"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span className="text-[#25D366]">Order via WhatsApp</span>
            </a>

            {/* Instagram Button */}
            <a
              href="https://instagram.com/dxbbrands"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-luxury flex items-center justify-center gap-3 bg-[#E4405F]/10 border-[#E4405F]/30 hover:border-[#E4405F]/60"
            >
              <Instagram className="w-5 h-5 text-[#E4405F]" />
              <span className="text-[#E4405F]">Order via Instagram</span>
            </a>
          </motion.div>

          {/* Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center font-elegant text-sm italic text-muted-foreground"
          >
            We respond within 24 hours
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
