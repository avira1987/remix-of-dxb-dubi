import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Check, Loader2, Image, AlertCircle, ArrowLeft, ArrowRight, Package, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UploadedProduct {
  id: string;
  tempId: string;
  imageUrl: string;
  fileName: string;
  status: 'uploading' | 'uploaded' | 'creating' | 'done' | 'error';
  error?: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface BulkProductUploadProps {
  onComplete: () => void;
}

type UploadMode = 'manual' | 'preset';
type WizardStep = 'mode' | 'preset-select' | 'upload' | 'progress';

const MAX_FILES = 100;
const NONE_VALUE = '__none__'; // Radix Select doesn't allow empty string for SelectItem

const BulkProductUpload = ({ onComplete }: BulkProductUploadProps) => {
  const [step, setStep] = useState<WizardStep>('mode');
  const [uploadMode, setUploadMode] = useState<UploadMode | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedProducts, setUploadedProducts] = useState<UploadedProduct[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('id, name').eq('is_active', true);
    setBrands(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').eq('is_active', true);
    setCategories(data || []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length > MAX_FILES) {
      toast({
        title: 'Too many files',
        description: `You can upload maximum ${MAX_FILES} images at once`,
        variant: 'destructive',
      });
      return;
    }

    setFiles(prev => [...prev, ...imageFiles].slice(0, MAX_FILES));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length + imageFiles.length > MAX_FILES) {
      toast({
        title: 'Too many files',
        description: `You can upload maximum ${MAX_FILES} images at once`,
        variant: 'destructive',
      });
      return;
    }

    setFiles(prev => [...prev, ...imageFiles].slice(0, MAX_FILES));
  }, [files.length, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-');
  };

  const generateProductName = (fileName: string) => {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setStep('progress');
    setIsUploading(true);
    setProgress(0);

    const totalFiles = files.length;
    let completedFiles = 0;
    const newProducts: UploadedProduct[] = [];

    const initialProducts: UploadedProduct[] = files.map((file, index) => ({
      id: '',
      tempId: `temp-${index}-${Date.now()}`,
      imageUrl: '',
      fileName: file.name,
      status: 'uploading' as const,
    }));
    setUploadedProducts(initialProducts);

    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (file, batchIndex) => {
        const index = i + batchIndex;
        const tempId = initialProducts[index].tempId;

        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${index}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          setUploadedProducts(prev => 
            prev.map(p => p.tempId === tempId ? { ...p, status: 'creating' as const, imageUrl: publicUrl } : p)
          );

          const productName = generateProductName(file.name);
          const productData: {
            name: string;
            slug: string;
            image_url: string;
            price: number;
            stock_quantity: number;
            is_active: boolean;
            description: string;
            brand_id?: string;
            category_id?: string;
          } = {
            name: productName,
            slug: generateSlug(productName) + '-' + Date.now() + index,
            image_url: publicUrl,
            price: 0,
            stock_quantity: 0,
            is_active: false,
            description: 'Pending details',
          };

          // Add brand and category if preset mode is selected
          if (uploadMode === 'preset') {
            if (selectedBrand && selectedBrand !== NONE_VALUE) {
              productData.brand_id = selectedBrand;
            }
            if (selectedCategory && selectedCategory !== NONE_VALUE) {
              productData.category_id = selectedCategory;
            }
          }

          const { data: productDataResult, error: productError } = await supabase
            .from('products')
            .insert(productData)
            .select('id')
            .single();

          if (productError) throw productError;

          setUploadedProducts(prev => 
            prev.map(p => p.tempId === tempId ? { 
              ...p, 
              id: productDataResult.id, 
              status: 'done' as const,
              imageUrl: publicUrl 
            } : p)
          );

          newProducts.push({
            id: productDataResult.id,
            tempId,
            imageUrl: publicUrl,
            fileName: file.name,
            status: 'done',
          });

        } catch (error) {
          console.error('Error uploading:', error);
          setUploadedProducts(prev => 
            prev.map(p => p.tempId === tempId ? { 
              ...p, 
              status: 'error' as const,
              error: 'Upload failed' 
            } : p)
          );
        }

        completedFiles++;
        setProgress(Math.round((completedFiles / totalFiles) * 100));
      }));
    }

    setIsUploading(false);
    setFiles([]);

    const successCount = newProducts.length;
    const errorCount = totalFiles - successCount;

    toast({
      title: 'Upload Complete',
      description: `${successCount} products created${errorCount > 0 ? `, ${errorCount} failed` : ''}. Click on products to add details.`,
    });

    if (successCount > 0) {
      onComplete();
    }
  };

  const clearAll = () => {
    setFiles([]);
    setUploadedProducts([]);
    setProgress(0);
  };

  const resetWizard = () => {
    setStep('mode');
    setUploadMode(null);
    setSelectedBrand('');
    setSelectedCategory('');
    setFiles([]);
    setUploadedProducts([]);
    setProgress(0);
  };

  const handleModeSelect = (mode: UploadMode) => {
    setUploadMode(mode);
    if (mode === 'manual') {
      setStep('upload');
    } else {
      setStep('preset-select');
    }
  };

  const canProceedToUpload = () => {
    if (uploadMode === 'preset') {
      return (selectedBrand && selectedBrand !== '') || (selectedCategory && selectedCategory !== '');
    }
    return true;
  };

  // Step 1: Mode Selection
  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display text-foreground mb-2">Select Upload Type</h2>
        <p className="text-muted-foreground">How would you like to upload products?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Upload Option */}
        <button
          onClick={() => handleModeSelect('manual')}
          className="group relative p-6 bg-card border-2 border-border/50 rounded-xl hover:border-primary/50 transition-all text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground mb-2">Manual Upload</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload images first, then set brand and category for each product individually
              </p>
            </div>
          </div>
          <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Preset Upload Option */}
        <button
          onClick={() => handleModeSelect('preset')}
          className="group relative p-6 bg-card border-2 border-border/50 rounded-xl hover:border-primary/50 transition-all text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground mb-2">Bulk Upload with Brand/Category</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select brand and category first, then all products will be uploaded with those settings
              </p>
            </div>
          </div>
          <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );

  // Step 2: Preset Selection (Brand & Category)
  const renderPresetSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setStep('mode')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-display text-foreground">Select Brand & Category</h2>
          <p className="text-sm text-muted-foreground">All products will be created with these settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Brand (Optional)
          </Label>
          <Select value={selectedBrand || undefined} onValueChange={setSelectedBrand}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No brand</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Category (Optional)
          </Label>
          <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(selectedBrand || selectedCategory) && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <p className="text-sm text-foreground">
            <span className="font-medium">Selected settings: </span>
            {selectedBrand ? (selectedBrand === NONE_VALUE ? 'No brand' : brands.find(b => b.id === selectedBrand)?.name) : ''}
            {selectedBrand && selectedCategory && ' • '}
            {selectedCategory ? (selectedCategory === NONE_VALUE ? 'No category' : categories.find(c => c.id === selectedCategory)?.name) : ''}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep('upload')} 
          disabled={!canProceedToUpload()}
          className="bg-primary hover:bg-primary/90"
        >
          Continue to Upload
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Step 3: File Upload
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setStep(uploadMode === 'preset' ? 'preset-select' : 'mode')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-display text-foreground">Upload Images</h2>
          <p className="text-sm text-muted-foreground">
            {uploadMode === 'preset' && (selectedBrand || selectedCategory) ? (
              <>
                Brand: {selectedBrand ? (selectedBrand === NONE_VALUE ? 'None' : brands.find(b => b.id === selectedBrand)?.name) : 'None'}
                {' • '}
                Category: {selectedCategory ? (selectedCategory === NONE_VALUE ? 'None' : categories.find(c => c.id === selectedCategory)?.name) : 'None'}
              </>
            ) : (
              `Upload up to ${MAX_FILES} images`
            )}
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="bulk-upload"
          disabled={isUploading}
        />
        <label htmlFor="bulk-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Up to {MAX_FILES} images (JPG, PNG, WEBP)
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              Selected Images ({files.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
              <Button 
                onClick={uploadFiles} 
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {!isUploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white truncate">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
        <h4 className="font-medium text-foreground mb-2">How it works:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Select or drag & drop up to {MAX_FILES} product images</li>
          <li>Click "Upload All" to create draft products</li>
          <li>Products will be created with images but marked as inactive</li>
          <li>Go to "All Products" tab to add details (price, category, brand, etc.)</li>
        </ol>
      </div>
    </div>
  );

  // Step 4: Progress View
  const renderProgress = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display text-foreground">Uploading...</h2>
          <p className="text-sm text-muted-foreground">{progress}% complete</p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Please wait...
          </p>
        </div>
      )}

      {uploadedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              Upload Progress
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-500 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {uploadedProducts.filter(p => p.status === 'done').length} done
              </span>
              {uploadedProducts.some(p => p.status === 'error') && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {uploadedProducts.filter(p => p.status === 'error').length} failed
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {uploadedProducts.map((product) => (
              <div
                key={product.tempId}
                className="relative aspect-square bg-muted rounded-lg overflow-hidden"
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}

                {/* Status Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center ${
                  product.status === 'done' ? 'bg-green-500/20' :
                  product.status === 'error' ? 'bg-destructive/20' :
                  'bg-background/50'
                }`}>
                  {(product.status === 'uploading' || product.status === 'creating') && (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  )}
                  {product.status === 'done' && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                  {product.status === 'error' && (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-xs text-white truncate">{product.fileName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isUploading && uploadedProducts.length > 0 && (
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={resetWizard}>
            New Upload
          </Button>
          <Button onClick={onComplete} className="bg-primary hover:bg-primary/90">
            View Products
          </Button>
        </div>
      )}
    </div>
  );

  // Wizard Steps Indicator
  const renderStepsIndicator = () => {
    const steps = uploadMode === 'preset' 
      ? ['Select Type', 'Settings', 'Upload', 'Complete']
      : ['Select Type', 'Upload', 'Complete'];
    
    const currentStepIndex = uploadMode === 'preset'
      ? step === 'mode' ? 0 : step === 'preset-select' ? 1 : step === 'upload' ? 2 : 3
      : step === 'mode' ? 0 : step === 'upload' ? 1 : 2;

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              index <= currentStepIndex 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {index + 1}
            </div>
            <span className={`hidden sm:block mx-2 text-sm ${
              index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {s}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${
                index < currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {step !== 'mode' && renderStepsIndicator()}
      
      {step === 'mode' && renderModeSelection()}
      {step === 'preset-select' && renderPresetSelection()}
      {step === 'upload' && renderUploadStep()}
      {step === 'progress' && renderProgress()}
    </div>
  );
};

export default BulkProductUpload;
