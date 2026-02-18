import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CategoryGateway from "@/components/CategoryGateway";
import BrandSelection from "@/components/BrandSelection";
import SubCategoryGrid from "@/components/SubCategoryGrid";
import ProductShowcase from "@/components/ProductShowcase";
import Footer from "@/components/Footer";

type Screen = "gateway" | "brands" | "subcategories" | "product";

// Error Boundary for Index page
class IndexErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // #region agent log
    try {
      const logData = {location:'Index.tsx:20',message:'Index error boundary caught',data:{error:String(error),componentStack:errorInfo.componentStack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.error('[DEBUG]', logData);
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    } catch(e) {}
    // #endregion
    console.error("Index page error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-display text-foreground mb-4">خطا در بارگذاری صفحه</h1>
            <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              بارگذاری مجدد
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Index = () => {
  // #region agent log
  useEffect(() => {
    try {
      const logData = {location:'Index.tsx:50',message:'Index component mounted',data:{path:window.location.pathname,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logData);
      fetch('http://127.0.0.1:7242/ingest/eb6361b3-d1c8-4192-ba81-a2aae43466fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    } catch(e) {
      console.error('[DEBUG] Index mount error:', e);
    }
  }, []);
  // #endregion
  
  console.log('Index component rendering...');
  
  const [currentScreen, setCurrentScreen] = useState<Screen>("gateway");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentScreen("brands");
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentScreen("subcategories");
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentScreen("product");
  };

  const handleBack = () => {
    switch (currentScreen) {
      case "brands":
        setCurrentScreen("gateway");
        setSelectedCategory("");
        break;
      case "subcategories":
        setCurrentScreen("brands");
        setSelectedBrand("");
        break;
      case "product":
        setCurrentScreen("subcategories");
        setSelectedProduct("");
        break;
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.4,
  };

  return (
    <IndexErrorBoundary>
      <div className="min-h-screen bg-background overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === "gateway" && (
            <motion.div
              key="gateway"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <CategoryGateway onCategorySelect={handleCategorySelect} />
            </motion.div>
          )}

        {currentScreen === "brands" && (
          <motion.div
            key="brands"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <BrandSelection
              selectedCategory={selectedCategory}
              onBrandSelect={handleBrandSelect}
              onBack={handleBack}
            />
            <Footer />
          </motion.div>
        )}

        {currentScreen === "subcategories" && (
          <motion.div
            key="subcategories"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <SubCategoryGrid
              selectedBrand={selectedBrand}
              selectedCategory={selectedCategory}
              onProductSelect={handleProductSelect}
              onBack={handleBack}
            />
            <Footer />
          </motion.div>
        )}

        {currentScreen === "product" && (
          <motion.div
            key="product"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ProductShowcase
              selectedBrand={selectedBrand}
              productId={selectedProduct}
              onBack={handleBack}
            />
            <Footer />
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </IndexErrorBoundary>
  );
};

export default Index;
