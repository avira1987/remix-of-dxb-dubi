import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, FolderTree, Building2, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  productsCount: number;
  categoriesCount: number;
  brandsCount: number;
  activeProducts: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    categoriesCount: 0,
    brandsCount: 0,
    activeProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes, activeProductsRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('brands').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        ]);

        setStats({
          productsCount: productsRes.count || 0,
          categoriesCount: categoriesRes.count || 0,
          brandsCount: brandsRes.count || 0,
          activeProducts: activeProductsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.productsCount,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Categories',
      value: stats.categoriesCount,
      icon: FolderTree,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Brands',
      value: stats.brandsCount,
      icon: Building2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground font-body">Welcome to your admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-8 bg-muted rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-display font-bold text-foreground">
                    {stat.value.toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg text-foreground">Quick Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground font-body text-sm">
          <p>
            Use the sidebar navigation to access different sections of the admin panel:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-foreground">Products:</strong> Add, edit, and delete products</li>
            <li><strong className="text-foreground">Categories:</strong> Manage product categories</li>
            <li><strong className="text-foreground">Brands:</strong> Manage available brands</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
