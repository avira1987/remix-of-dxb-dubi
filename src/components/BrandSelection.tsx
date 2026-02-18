import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Shirt, Watch, Gem, Glasses, Footprints, Search, X } from "lucide-react";

interface BrandSelectionProps {
  selectedCategory: string;
  onBrandSelect: (productType: string) => void;
  onBack: () => void;
}

const productTypes = [
  { name: "Bags", icon: Briefcase },
  { name: "Shoes", icon: Footprints },
  { name: "Clothing", icon: Shirt },
  { name: "Watches", icon: Watch },
  { name: "Jewelry", icon: Gem },
  { name: "Eyewear", icon: Glasses },
];

const BrandSelection = ({ selectedCategory, onBrandSelect, onBack }: BrandSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter product types based on search query
  const filteredProductTypes = productTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              DXB_BRANDS
            </p>
            <p className="font-body text-xs tracking-[0.2em] text-muted-foreground mt-0.5">
              {selectedCategory}
            </p>
          </div>
          <div className="w-5" />
        </div>
      </motion.header>

      <div className="pt-24 pb-8 px-6">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-2xl text-foreground">Select Product Type</h2>
          <p className="font-elegant text-sm italic text-muted-foreground mt-2">
            Browse our exclusive collection
          </p>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="divider-gold mx-auto w-24 mb-6"
        />

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6 max-w-md mx-auto"
        >
          <div className="glass-card rounded-sm p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search product types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-noir-elevated border border-border rounded-sm py-3 pl-10 pr-10 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Product Type Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {filteredProductTypes.length > 0 ? (
            filteredProductTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <motion.button
                  key={type.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6 + index * 0.08,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  onClick={() => onBrandSelect(type.name)}
                  className="group relative aspect-square glass-card rounded-sm overflow-hidden flex flex-col items-center justify-center gap-4"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-noir-elevated border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors duration-500">
                    <IconComponent className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                  </div>

                  {/* Name */}
                  <span className="font-display text-base tracking-[0.1em] text-foreground/80 group-hover:text-primary transition-colors duration-500">
                    {type.name}
                  </span>

                  {/* Bottom border accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 text-center py-12"
            >
              <p className="font-body text-muted-foreground">No product types found</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandSelection;
