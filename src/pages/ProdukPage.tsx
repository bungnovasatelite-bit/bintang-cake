import React, { useMemo } from 'react';
import { Search, X, ArrowUpDown, Plus } from 'lucide-react';
import { ProductCard } from '../components/common/ProductCard';
import { useNavigation } from '../context/NavigationContext';
import { useCMS } from '../context/CMSContext';

export const ProdukPage: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useNavigation();
  const { products, isAdminLoggedIn, openCMSToAddProduct } = useCMS();
  const [sortBy, setSortBy] = React.useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'cake', label: 'Cake' },
    { id: 'cookies', label: 'Cookies' },
    { id: 'brownies', label: 'Brownies' },
    { id: 'hampers', label: 'Hampers' },
    { id: 'lidah-kucing', label: 'Lidah Kucing' },
    { id: 'custom', label: 'Custom' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesPkg = product.packageType?.toLowerCase().includes(query);
        return matchesName || matchesCat || matchesPkg;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // Default/popular keeps curated order
    });
  }, [selectedCategory, searchQuery, sortBy, products]);

  const currentCategoryLabel = categories.find(c => c.id === selectedCategory)?.label || 'Produk';

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Search Bar */}
      <div className="relative">
        <div className="flex items-center w-full px-4 py-3 rounded-2xl bg-[#FFFDFB] border border-[#E8DACB] shadow-sm focus-within:border-[#4A2810] focus-within:ring-2 focus-within:ring-[#4A2810]/15 transition-all">
          <Search className="w-5 h-5 text-[#8C7A6B] mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Cari cake, cookies, brownies, hampers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#3D2314] placeholder-[#A8988B] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-[#8C7A6B] hover:text-[#3D2314] transition-colors cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#4A2810] text-[#FFFDF9] shadow-sm'
                  : 'bg-[#FFFDFB] text-[#5C4534] border border-[#EFE5D9] hover:bg-[#F3E8DA]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. Result Count & Sort Controls + Admin Add Button */}
      <div className="flex items-center justify-between text-xs text-[#8C7A6B] px-1 pt-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5E3C]" />
          <span>Menampilkan <strong className="text-[#3D2314]">{filteredProducts.length}</strong> {currentCategoryLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {isAdminLoggedIn && (
            <button
              onClick={() => openCMSToAddProduct(selectedCategory !== 'all' ? selectedCategory : 'cake')}
              className="px-2.5 py-1 rounded-xl bg-[#4A2810] text-white font-bold text-[10.5px] flex items-center gap-1 shadow-xs hover:bg-[#341A08] transition-colors cursor-pointer"
              title={`Tambah ${currentCategoryLabel}`}
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>Tambah {currentCategoryLabel !== 'Semua' ? currentCategoryLabel : 'Produk'}</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7A6B]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-[#4A2810] focus:outline-none cursor-pointer pr-1"
            >
              <option value="popular">Terpopuler</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price-low">Harga Terendah</option>
              <option value="price-high">Harga Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-3xl bg-[#FFFDFB] border border-[#EFE5D9] mt-4 space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FAF5EE] text-[#8C7A6B] flex items-center justify-center mx-auto mb-1">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#3D2314]">
              Belum Ada Produk {currentCategoryLabel}
            </h4>
            <p className="text-xs text-[#8C7A6B] max-w-xs mx-auto mt-1">
              {searchQuery
                ? `Tidak ada produk yang cocok dengan "${searchQuery}".`
                : `Kategori ${currentCategoryLabel} belum memiliki item atau sedang dalam proses pembuatan.`}
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            {isAdminLoggedIn ? (
              <button
                onClick={() => openCMSToAddProduct(selectedCategory !== 'all' ? selectedCategory : 'cake')}
                className="px-4 py-2 rounded-xl bg-[#4A2810] text-white text-xs font-bold hover:bg-[#341A08] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tambah {currentCategoryLabel} Baru</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#4A2810] text-white text-xs font-semibold hover:bg-[#341A08] transition-all cursor-pointer"
              >
                Lihat Semua Produk
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
