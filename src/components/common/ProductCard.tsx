import React from 'react';
import { Star, Plus, Pencil } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from './Badge';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useCMS } from '../../context/CMSContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { openProductDetail } = useNavigation();
  const { isAdminLoggedIn, openCMSToEditProduct } = useCMS();

  const formatIDR = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case 'BEST SELLER':
        return 'bestseller';
      case 'NEW ARRIVAL':
        return 'new';
      case 'CUSTOM':
        return 'custom';
      case 'SPECIAL GIFT':
        return 'gift';
      default:
        return 'promo';
    }
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCMSToEditProduct(product);
  };

  return (
    <div
      onClick={() => openProductDetail(product)}
      className="group bg-[#FFFDFB] rounded-3xl p-2.5 shadow-sm hover:shadow-md border border-[#EFE5D9] flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-[0.99] relative"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F5EFE6] mb-2.5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badge at top left */}
          {product.badge && (
            <div className="absolute top-2 left-2 z-10">
              <Badge variant={getBadgeVariant(product.badge)} size="sm">
                {product.badge}
              </Badge>
            </div>
          )}

          {/* Quick Edit button for Admin */}
          {isAdminLoggedIn && (
            <button
              onClick={handleEditClick}
              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-[#4A2810] hover:bg-[#4A2810] hover:text-white flex items-center justify-center shadow-md transition-all"
              title="Edit Produk Ini (Admin)"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1 text-[11px] mb-1">
          <Star className="w-3.5 h-3.5 fill-[#D4A373] text-[#D4A373]" />
          <span className="font-bold text-[#3D2314]">{product.rating.toFixed(1)}</span>
          <span className="text-[#8C7A6B]">({product.reviewCount})</span>
        </div>

        {/* Product Title */}
        <h3 className="font-serif font-bold text-sm text-[#3D2314] line-clamp-1 group-hover:text-[#8B5E3C] transition-colors">
          {product.name}
        </h3>

        {/* Subtitle / Package */}
        <p className="text-[9.5px] font-semibold text-[#9C8573] uppercase tracking-wider mt-0.5 line-clamp-1">
          {product.packageType || product.category}
        </p>
      </div>

      {/* Price & Action Button */}
      <div className="flex items-center justify-between mt-3 pt-1 border-t border-[#F5EFE6]">
        <div>
          <span className="block text-[9.5px] text-[#9C8573] leading-none mb-0.5">
            Harga
          </span>
          <span className="font-serif font-bold text-sm sm:text-base text-[#3D2314] leading-tight">
            {formatIDR(product.price)}
          </span>
        </div>

        <button
          onClick={handlePlusClick}
          aria-label={`Tambah ${product.name} ke keranjang`}
          className="w-8 h-8 rounded-full bg-[#4A2810] text-white flex items-center justify-center hover:bg-[#341A08] active:scale-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
