import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, X, Camera, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-fashion.jpg";
import BestsellerBar from "./BestsellerBar";

// Import custom line art icons as fallback
import iconMen from "@/assets/icon-men.jpg";
import iconWomen from "@/assets/icon-women.jpg";
import iconGirls from "@/assets/icon-girls.jpg";
import iconBoys from "@/assets/icon-boys.jpg";
import iconTravel from "@/assets/icon-travel.jpg";
import iconHome from "@/assets/icon-home.jpg";

interface CategoryGatewayProps {
  onCategorySelect: (category: string) => void;
}

// Map category names to their fallback icons
const CategoryIconImages: Record<string, string> = {
  Men: iconMen,
  Women: iconWomen,
  Girls: iconGirls,
  Boys: iconBoys,
  "Travel & Trolley": iconTravel,
  "Home Collection": iconHome,
};

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
}

const CategoryGateway = ({ onCategorySelect }: CategoryGatewayProps) => {
  // #region agent log
  useEffect(() => {
    try {
      const logData = {location:'CategoryGateway.tsx:38',message:'CategoryGateway mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logData);
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    } catch(e) {
      console.error('[DEBUG] CategoryGateway mount error:', e);
    }
  }, []);
  // #endregion
  
  const [showGuide, setShowGuide] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      // #region agent log
      try {
        const logData = {location:'CategoryGateway.tsx:50',message:'fetchCategories start',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
        console.log('[DEBUG]', logData);
        fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
      } catch(e) {}
      // #endregion
      
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .is("parent_id", null)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        // #region agent log
        const logData = {location:'CategoryGateway.tsx:60',message:'fetchCategories result',data:{hasData:!!data,dataLength:data?.length||0,hasError:!!error,error:error?.message||''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
        console.log('[DEBUG]', logData);
        fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        // #endregion

        if (!error && data) {
          setCategories(data);
        }
        setLoading(false);
      } catch(error) {
        // #region agent log
        const logData = {location:'CategoryGateway.tsx:70',message:'fetchCategories exception',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
        console.error('[DEBUG]', logData);
        fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        // #endregion
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fallback categories if none in DB
  const displayCategories = categories.length > 0 ? categories : [
    { id: "1", name: "Men", description: "Refined Masculinity", image_url: null, slug: "men" },
    { id: "2", name: "Women", description: "Timeless Elegance", image_url: null, slug: "women" },
    { id: "3", name: "Girls", description: "Youthful Grace", image_url: null, slug: "girls" },
    { id: "4", name: "Boys", description: "Distinguished Style", image_url: null, slug: "boys" },
    { id: "5", name: "Travel & Trolley", description: "Journey in Luxury", image_url: null, slug: "travel" },
    { id: "6", name: "Home Collection", description: "Living Artistry", image_url: null, slug: "home" },
  ];

  // #region agent log
  useEffect(() => {
    try {
      const logData = {location:'CategoryGateway.tsx:75',message:'CategoryGateway render check',data:{loading,categoriesCount:categories.length,heroImage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logData);
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    } catch(e) {}
  }, [loading, categories.length]);
  // #endregion

  return (
    <div className="relative min-h-screen bg-background overflow-y-auto">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src={heroImage}
          alt="Luxury Fashion"
          className="w-full h-full object-cover"
          onError={(e) => {
            // #region agent log
            const logData = {location:'CategoryGateway.tsx:90',message:'heroImage load error',data:{src:heroImage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
            console.error('[DEBUG]', logData);
            fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
            // #endregion
            // Hide image if it fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="px-4 pt-6 pb-2 text-center"
        >
          <h1 className="font-display text-3xl tracking-[0.4em] text-gradient-gold">
            DXB
          </h1>
          <p className="font-body text-xs tracking-[0.4em] text-muted-foreground mt-1">
            BRANDS
          </p>
        </motion.header>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeInOut" }}
          className="divider-gold mx-auto w-24"
        />

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-center mt-2 px-6"
        >
          <p className="font-elegant text-base italic text-foreground/80">
            "Where Elegance Meets Excellence"
          </p>
        </motion.div>

        {/* Social Icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-4 mt-4"
        >
          <a
            href="https://wa.me/YOUR_WHATSAPP_NUMBER"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center hover:bg-[#25D366]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366]" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <a
            href="https://instagram.com/YOUR_INSTAGRAM"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#E4405F]/10 border border-[#E4405F]/30 flex items-center justify-center hover:bg-[#E4405F]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#E4405F]" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </motion.div>

        {/* Bestseller Bar */}
        <BestsellerBar />

        {/* Category Selection */}
        <div className="flex flex-col items-center justify-center px-4 py-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3"
          >
            Select Category
          </motion.p>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card rounded-sm p-3 h-24 animate-pulse bg-muted/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {displayCategories.map((category, index) => {
                const iconSrc = category.image_url || CategoryIconImages[category.name] || iconMen;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 1.3 + index * 0.08,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                    onClick={() => onCategorySelect(category.name)}
                    className="group relative glass-card rounded-sm p-3 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-all duration-500"
                  >
                    {/* Custom Line Art Icon */}
                    <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img 
                        src={iconSrc} 
                        alt={category.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="font-display text-xs text-foreground group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </h3>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-sm" />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Guide Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="px-4 pb-3"
        >
          <button
            onClick={() => setShowGuide(true)}
            className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 glass-card rounded-sm py-2.5 hover:border-primary/50 transition-colors group"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="font-body text-xs text-foreground group-hover:text-primary transition-colors">
              How to Order
            </span>
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="pb-3 flex flex-col items-center"
        >
          <ChevronDown className="w-4 h-4 text-primary/60 animate-bounce" />
        </motion.div>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-card rounded-sm p-6 relative"
            >
              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display text-xl text-gradient-gold text-center mb-6">
                How to Order
              </h3>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-primary">1</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Camera className="w-4 h-4 text-primary" />
                      <p className="font-body text-sm text-foreground">Take a Screenshot</p>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      Browse products and screenshot the item you want
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-primary">2</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      <p className="font-body text-sm text-foreground">Click WhatsApp</p>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      Tap the WhatsApp icon below the product image
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-primary">3</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Send className="w-4 h-4 text-primary" />
                      <p className="font-body text-sm text-foreground">Send Your Order</p>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      Send the screenshot and complete your order
                    </p>
                  </div>
                </div>
              </div>

              <div className="divider-gold my-6" />

              <p className="font-elegant text-center text-sm italic text-muted-foreground">
                Simple & Fast!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryGateway;
