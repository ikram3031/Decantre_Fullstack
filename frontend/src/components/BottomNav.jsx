import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../core/context/AppContext';
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  Compass, 
  User 
} from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlist, cart, setIsCartOpen, user, setAuthModal } = useApp();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-black/95 backdrop-blur-lg border-t border-gold/30 px-3 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <nav className="flex items-center justify-around text-gold">
        {/* Home */}
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${isActive('/') ? 'text-gold font-bold' : 'text-gold/70 hover:text-gold'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-sans">Home</span>
        </Link>

        {/* Shop */}
        <Link 
          to="/shop" 
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${isActive('/shop') ? 'text-gold font-bold' : 'text-gold/70 hover:text-gold'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-sans">Shop</span>
        </Link>

        {/* Wishlist */}
        <Link 
          to="/wishlist" 
          className={`flex flex-col items-center gap-1 p-1 relative transition-colors ${isActive('/wishlist') ? 'text-gold font-bold' : 'text-gold/70 hover:text-gold'}`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-gold text-gold' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gold text-black rounded-full text-[8px] w-3.5 h-3.5 font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-wider font-sans">Wishlist</span>
        </Link>

        {/* Cart */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 p-1 relative transition-colors text-gold/70 hover:text-gold cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gold text-black rounded-full text-[8px] w-3.5 h-3.5 font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] uppercase tracking-wider font-sans">Cart</span>
        </button>

        {/* Account / Login */}
        <button 
          onClick={() => {
            if (user) {
              navigate('/account');
            } else {
              setAuthModal(true, 'login');
            }
          }}
          className="flex flex-col items-center gap-1 p-1 transition-colors text-gold/70 hover:text-gold cursor-pointer"
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-sans">{user ? 'Account' : 'Login'}</span>
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;

