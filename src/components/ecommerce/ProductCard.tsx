
import { useState } from 'react';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  category: string;
  description: string;
  inStock: boolean;
  discount?: number;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onViewProduct: (productId: string) => void;
}

const ProductCard = ({ product, onAddToCart, onViewProduct }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-red-500 text-white">Destaque</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-green-500 text-white">-{discountPercentage}%</Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary">Esgotado</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Add to Cart */}
        <div className={`absolute bottom-2 left-2 right-2 transition-all duration-300 ${isHovered ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0'}`}>
          <Button 
            size="sm" 
            className="w-full"
            disabled={!product.inStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.inStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
          </Button>
        </div>
      </div>

      <CardContent className="p-4" onClick={() => onViewProduct(product.id)}>
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">{product.category}</Badge>
        </div>
        
        <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-green-600">
              R$ {product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
