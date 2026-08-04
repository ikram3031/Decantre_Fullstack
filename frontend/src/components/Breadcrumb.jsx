import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../core/context/AppContext';

export const Breadcrumb = ({ items }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentTheme, products } = useApp();
  const isLight = currentTheme === 'light';

  // Do not show breadcrumb on homepage if path is '/'
  if (!items && location.pathname === '/') {
    return null;
  }

  const currentPath = location.pathname;

  // Custom 3-step checkout breadcrumb for Cart, Checkout, and Order Status / Thank You pages
  if (!items && ['/cart', '/checkout', '/thank-you'].includes(currentPath)) {
    const steps = [
      { num: 1, label: 'Shopping Cart', path: '/cart' },
      { num: 2, label: 'Checkout', path: '/checkout' },
      { num: 3, label: 'Order Status', path: '/thank-you' }
    ];

    let currentStepIndex = 0;
    if (currentPath === '/checkout') currentStepIndex = 1;
    if (currentPath === '/thank-you') currentStepIndex = 2;

    return (
      <nav
        aria-label="Checkout Progress"
        className={`w-full py-3.5 px-4 sm:px-6 lg:px-8 border-b ${
          isLight ? 'bg-zinc-100/80 border-zinc-200 text-zinc-700' : 'bg-black/80 border-gold/15 text-zinc-300'
        } text-xs font-sans transition-colors`}
      >
        <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isUpcoming = idx > currentStepIndex;

            return (
              <React.Fragment key={step.num}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 mx-0.5" />
                )}

                <div className="flex items-center gap-2">
                  {/* Circle Badge */}
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold font-sans transition-all ${
                      isCompleted || isCurrent
                        ? 'bg-zinc-900 border border-zinc-600 text-white shadow-xs'
                        : 'bg-transparent border border-zinc-500 text-zinc-400 font-normal'
                    }`}
                  >
                    {step.num}
                  </span>

                  {/* Label */}
                  {isCompleted ? (
                    <Link
                      to={step.path}
                      className="text-zinc-300 hover:text-white transition-colors font-medium hover:underline"
                    >
                      {step.label}
                    </Link>
                  ) : isCurrent ? (
                    <span className={`font-semibold tracking-wide ${isLight ? 'text-black' : 'text-white'}`}>
                      {step.label}
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-normal">{step.label}</span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    );
  }

  // Route labels
  const routeMap = {
    '/shop': 'Shop',
    '/catalog': 'Catalog',
    '/cart': 'Shopping Cart',
    '/checkout': 'Checkout',
    '/wishlist': 'Wishlist',
    '/season': 'Seasonal Collections',
    '/combo': 'Combo Bundles',
    '/about-us': 'About Us',
    '/faq': 'Frequently Asked Questions',
    '/contact-us': 'Contact Us',
    '/privacy-policy': 'Privacy Policy',
    '/return-policy': 'Return Policy',
    '/terms-and-condition': 'Terms & Conditions',
    '/reviews': 'Client Reviews',
    '/thank-you': 'Order Confirmation',
    '/product': 'Product Details'
  };

  let breadcrumbItems = [];

  if (items && items.length > 0) {
    breadcrumbItems = items;
  } else {
    breadcrumbItems.push({ label: 'Home', link: '/' });

    const path = location.pathname;
    const categoryParam = searchParams.get('category');
    const brandParam = searchParams.get('brand') || searchParams.get('search');
    const didParam = searchParams.get('did') || searchParams.get('id');

    if (path === '/shop') {
      breadcrumbItems.push({ label: 'Shop', link: categoryParam || brandParam ? '/shop' : undefined });
      if (categoryParam) {
        breadcrumbItems.push({ label: categoryParam });
      } else if (brandParam) {
        breadcrumbItems.push({ label: `Brand: ${brandParam}` });
      }
    } else if (path === '/product' && didParam) {
      const prod = products.find(p => String(p.id) === String(didParam));
      breadcrumbItems.push({ label: 'Shop', link: '/shop' });
      if (prod && prod.category) {
        breadcrumbItems.push({ label: prod.category, link: `/shop?${new URLSearchParams({ category: prod.category }).toString()}` });
      }
      breadcrumbItems.push({ label: prod ? prod.name : 'Product Details' });
    } else if (routeMap[path]) {
      breadcrumbItems.push({ label: routeMap[path] });
    } else {
      const segment = path.replace('/', '').replace(/-/g, ' ');
      if (segment) {
        const formatted = segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbItems.push({ label: formatted });
      }
    }
  }

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`w-full py-3 px-4 sm:px-6 lg:px-8 border-b ${
        isLight ? 'bg-zinc-100/70 border-zinc-200 text-zinc-600' : 'bg-black/60 border-gold/15 text-zinc-400'
      } text-xs font-sans transition-colors`}
    >
      <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-1.5 sm:gap-2">
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mx-0.5" />
              )}
              {isLast || !item.link ? (
                <span className={`font-semibold tracking-wide truncate ${isLight ? 'text-amber-800' : 'text-gold'}`}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.link}
                  className={`hover:underline flex items-center gap-1 transition-colors ${
                    isLight ? 'text-zinc-600 hover:text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {idx === 0 && <Home className="w-3.5 h-3.5 inline shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumb;

