import React, { useEffect } from 'react';
import {
  ShieldCheck as IconShield,
  CheckCircle as IconCheck,
  ArrowLeft as IconBack,
  Loader2 as IconLoader,
  Award as IconAward,
  Lock as IconLock,
  ChevronDown,
  AlertTriangle as IconAlert,
  Video as IconVideo,
  Truck,
  Store,
  PhoneCall,
  Sparkles,
  FileText,
  Tag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatBDT as fmtBDT } from '../utils/formatCurrency';
import { useApp } from '../context/AppContext';
import { DISTRICTS as districtData } from '../lib/districts.js';

const DISTRICT_THANAS = {
  Dhaka: [
    { name: 'Savar' },
    { name: 'Ashulia' },
    { name: 'Dhamrai' },
    { name: 'Keraniganj' },
    { name: 'Nawabganj' },
    { name: 'Dohar' },
    { name: 'Adabor' },
    { name: 'Badda' },
    { name: 'Banani' },
    { name: 'Bangshal' },
    { name: 'Cantonment' },
    { name: 'Chawkbazar' },
    { name: 'Dakshinkhan' },
    { name: 'Darussalam' },
    { name: 'Demra' },
    { name: 'Dhanmondi' },
    { name: 'Gendaria' },
    { name: 'Gulshan' },
    { name: 'Hazaribagh' },
    { name: 'Jatrabari' },
    { name: 'Kadamtali' },
    { name: 'Kafrul' },
    { name: 'Kalabagan' },
    { name: 'Kamrangirchar' },
    { name: 'Khilgaon' },
    { name: 'Khilkhet' },
    { name: 'Kotwali' },
    { name: 'Lalbagh' },
    { name: 'Mirpur' },
    { name: 'Mohammadpur' },
    { name: 'Motijheel' },
    { name: 'Mugda' },
    { name: 'New Market' },
    { name: 'Pallabi' },
    { name: 'Paltan' },
    { name: 'Ramna' },
    { name: 'Rampura' },
    { name: 'Sabujbagh' },
    { name: 'Shah Ali' },
    { name: 'Shahbagh' },
    { name: 'Sher-e-Bangla Nagar' },
    { name: 'Shyampur' },
    { name: 'Sutrapur' },
    { name: 'Tejgaon' },
    { name: 'Tejgaon Industrial Area' },
    { name: 'Turag' },
    { name: 'Uttara Paschim' },
    { name: 'Uttara Purba' },
    { name: 'Uttarkhan' },
    { name: 'Vatara' },
    { name: 'Wari' }
  ],
  Gazipur: [
    { name: 'Tongi' },
    { name: 'Gazipur Sadar' },
    { name: 'Konabari' },
    { name: 'Kashimpur' },
    { name: 'Kaliakair' },
    { name: 'Kaliganj' },
    { name: 'Kapasia' },
    { name: 'Sreepur' }
  ],
  Narayanganj: [
    { name: 'Narayanganj Sadar' },
    { name: 'Bandar' },
    { name: 'Fatullah' },
    { name: 'Siddhirganj' },
    { name: 'Rupganj' },
    { name: 'Sonargaon' },
    { name: 'Araihazar' }
  ]
};

// Sort Thanas alphabetically at startup
Object.keys(DISTRICT_THANAS).forEach(key => {
  DISTRICT_THANAS[key].sort((a, b) => a.name.localeCompare(b.name));
});

export const Checkout = () => {
  const {
    cart,
    shippingInfo,
    setShippingInfo,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    sameAsBilling,
    setSameAsBilling,
    paymentDetails,
    setPaymentDetails,
    isProcessingOrder,
    handleCheckoutSubmit,
    orderCompleted,
    orderNumber,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    addToast,
    user,
    setAuthModal,
    promoCode,
    setPromoCode,
    applyPromoCode,
    promoError,
    appliedDiscount
  } = useApp();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) return;

    const valueFor = (key) =>
      user?.[key] ||
      user?.raw?.[key] ||
      user?.raw?.address?.[key] ||
      user?.raw?.shippingAddress?.[key] ||
      user?.raw?.billingInfo?.[key] ||
      user?.raw?.shippingInfo?.[key] ||
      user?.raw?.profile?.[key] ||
      "";

    const updates = {};
    if (!shippingInfo.fullName && (user.name || valueFor("fullName"))) updates.fullName = user.name || valueFor("fullName");
    if (!shippingInfo.email && valueFor("email")) updates.email = valueFor("email");
    if (!shippingInfo.phone && valueFor("phone")) updates.phone = valueFor("phone");
    if (!shippingInfo.address && valueFor("address")) updates.address = valueFor("address");
    if (!shippingInfo.thana && valueFor("thana")) updates.thana = valueFor("thana");
    if (!shippingInfo.district && valueFor("district")) updates.district = valueFor("district");
    if (!shippingInfo.city && valueFor("city")) updates.city = valueFor("city");
    if (!shippingInfo.zip && (valueFor("zip") || valueFor("postcode"))) {
      updates.zip = valueFor("zip") || valueFor("postcode");
    }

    if (Object.keys(updates).length > 0) {
      setShippingInfo((prev) => ({ ...prev, ...updates }));
    }
  }, [user, shippingInfo, setShippingInfo]);

  React.useEffect(() => {
    if (!sameAsBilling) return;
    if (!shippingInfo.fullName && !shippingInfo.address && !shippingInfo.district) return;
    if (shippingAddress.fullName || shippingAddress.address || shippingAddress.district) return;

    setShippingAddress((prev) => ({
      ...prev,
      fullName: shippingInfo.fullName,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      thana: shippingInfo.thana,
      district: shippingInfo.district,
      zip: shippingInfo.zip,
    }));
  }, [sameAsBilling, shippingInfo, shippingAddress.fullName, shippingAddress.address, shippingAddress.district, setShippingAddress]);

  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = React.useState(false);
  const [isShipDistrictOpen, setIsShipDistrictOpen] = React.useState(false);
  const [isThanaOpen, setIsThanaOpen] = React.useState(false);
  const [isShipThanaOpen, setIsShipThanaOpen] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [shipPhoneError, setShipPhoneError] = React.useState('');

  const validateEmail = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'Email address is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? '' : 'Please enter a valid email address.';
  };

  const normalizePhoneValue = (value) => {
    let raw = (value || '').toString().trim();
    if (!raw) return '';

    // Enforce that it starts with '+88'
    if (!raw.startsWith('+88')) {
      // Remove any leading non-digits to check
      const digits = raw.replace(/[^\d]/g, '');
      if (digits.startsWith('880')) {
        raw = `+${digits}`;
      } else if (digits.startsWith('0')) {
        raw = `+88${digits}`;
      } else if (digits.startsWith('1')) {
        raw = `+880${digits}`;
      } else {
        raw = `+88${digits}`;
      }
    }
    
    // Cleanup any characters except digits and the leading +
    const cleaned = '+' + raw.slice(1).replace(/[^\d]/g, '');
    return cleaned;
  };

  const validatePhoneValue = (value) => {
    const normalized = normalizePhoneValue(value);
    if (!normalized || normalized === '+88') return 'Phone number is required.';
    
    // Check pattern: Must start with +8801 followed by 3-9, then 8 digits (Total length: 14 characters including +88)
    const phoneRegex = /^\+8801[3-9]\d{8}$/;
    if (!phoneRegex.test(normalized)) {
      return 'Please enter a valid 11-digit Bangladeshi number starting with 01[3-9] (e.g. +88017XXXXXXXX).';
    }
    return '';
  };

  const handleBillingPhoneChange = (value) => {
    let normalized = normalizePhoneValue(value);
    // If user cleared it or tried to delete beyond prefix, keep the default prefix
    if (!normalized || normalized === '+') {
      normalized = '+88';
    }
    setShippingInfo((prev) => ({ ...prev, phone: normalized }));
    setPhoneError(validatePhoneValue(normalized));
  };

  const handleShippingPhoneChange = (value) => {
    let normalized = normalizePhoneValue(value);
    if (!normalized || normalized === '+') {
      normalized = '+88';
    }
    setShippingAddress((prev) => ({ ...prev, phone: normalized }));
    setShipPhoneError(validatePhoneValue(normalized));
  };

  const onFormSubmit = (e) => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    const phoneValidationError = validatePhoneValue(phone);
    const shippingPhoneValidationError = paymentMethod !== 'instore' && !sameAsBilling
      ? validatePhoneValue(shipPhone || '')
      : '';

    setEmailError(emailValidationError);
    setPhoneError(phoneValidationError);
    setShipPhoneError(shippingPhoneValidationError);

    if (!agreedToTerms) {
      addToast('Please read and agree to the website terms and conditions to place your order.', 'error');
      return;
    }

    if (emailValidationError) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    if (phoneValidationError) {
      addToast('Please enter a valid Bangladeshi phone number in format +8801[3-8]XXXXXXXX.', 'error');
      return;
    }

    if (shippingPhoneValidationError) {
      addToast('Please enter a valid recipient phone number in format +8801[3-8]XXXXXXXX.', 'error');
      return;
    }

    handleCheckoutSubmit(e);
  };

  const {
    fullName,
    phone,
    email,
    address,
    thana,
    district
  } = shippingInfo;

  const {
    fullName: shipFullName,
    phone: shipPhone,
    address: shipAddress,
    thana: shipThana,
    district: shipDistrict
  } = shippingAddress;

  // If cart is empty, send them back to shop
  useEffect(() => {
    if (cart.length === 0 && !orderCompleted) {
      addToast('Your shopping cart is empty.', 'info');
      navigate('/shop');
    }
  }, [cart, navigate, orderCompleted]);

  // Reactive redirect to thank you page on success
  useEffect(() => {
    if (orderCompleted) {
      const nextPath = orderNumber
        ? `/thank-you?orderId=${encodeURIComponent(orderNumber)}`
        : '/thank-you';
      navigate(nextPath, { replace: true });
    }
  }, [orderCompleted, navigate, orderNumber]);

  return (
    <div className="py-12 sm:py-20 bg-luxury-black animate-fade-in text-left">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-12 relative py-10 border-b border-gold/15">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-sans font-medium block">Secured Sourcing Ledger</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-light text-luxury-white tracking-wide">
            SECURE CHECKOUT
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-sans font-light max-w-xl mx-auto leading-relaxed">
            Please complete billing and delivery coordinates to initiate your decant bottling and courier transport.
          </p>
        </div>

        <form onSubmit={onFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Billing & Conditional Shipping Details */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-3">
                <Link to="/cart" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-gold transition-colors font-semibold">
                  <IconBack className="w-4 h-4 text-gold" /> Back to Cart
                </Link>
              </div>

              {/* Billing Address Section */}
              <div className="space-y-6 bg-zinc-900/90 p-6 border border-zinc-700/60 rounded-sm shadow-xl">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                    Billing Address Details
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Fields marked with <span className="text-rose-400 font-bold">*</span> are required.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder=""
                      value={fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder=""
                      value={email}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, email: e.target.value });
                        setEmailError(validateEmail(e.target.value));
                      }}
                      onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                      className={`w-full bg-zinc-800/80 border ${emailError ? 'border-rose-500' : 'border-zinc-700/80'} focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans`}
                    />
                    {emailError && <p className="mt-1.5 text-[10px] text-rose-400">{emailError}</p>}
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+8801712345678"
                      value={phone}
                      onChange={(e) => handleBillingPhoneChange(e.target.value)}
                      onBlur={(e) => setPhoneError(validatePhoneValue(e.target.value))}
                      className={`w-full bg-zinc-800/80 border ${phoneError ? 'border-rose-500' : 'border-zinc-700/80'} focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans`}
                    />
                    {phoneError && <p className="mt-1.5 text-[10px] text-rose-400">{phoneError}</p>}
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                      Street Address
                    </label>
                    <input 
                      type="text" 
                      placeholder=""
                      value={address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                    />
                  </div>

                  {/* District Dropdown */}
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                      District <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Select or type District"
                        value={district}
                        onFocus={() => setIsDistrictOpen(true)}
                        onBlur={() => setTimeout(() => setIsDistrictOpen(false), 200)}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, district: e.target.value, thana: '' });
                          setIsDistrictOpen(true);
                        }}
                        className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans pr-10"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    {isDistrictOpen && (
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-gold/30 rounded-sm z-50 py-1 shadow-2xl divide-y divide-white/5 scrollbar-thin">
                        {[...districtData]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .filter(d => d.name.toLowerCase().includes((district || '').toLowerCase()))
                          .map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setShippingInfo({ ...shippingInfo, district: d.name, thana: '' });
                                setIsDistrictOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-zinc-300 hover:text-white hover:bg-gold/20 text-xs transition-colors font-sans cursor-pointer"
                            >
                              {d.name}
                            </button>
                          ))}
                        {districtData.filter(d => d.name.toLowerCase().includes((district || '').toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-zinc-500 text-xs font-sans">
                            No districts found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Thana */}
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                      Thana / Upazila {['Dhaka', 'Gazipur', 'Narayanganj'].includes(district) && <span className="text-rose-400">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required={['Dhaka', 'Gazipur', 'Narayanganj'].includes(district)}
                        placeholder={['Dhaka', 'Gazipur', 'Narayanganj'].includes(district) ? "Select or type Thana" : "Enter Thana / Upazila"}
                        value={thana}
                        onFocus={() => {
                          if (['Dhaka', 'Gazipur', 'Narayanganj'].includes(district)) {
                            setIsThanaOpen(true);
                          }
                        }}
                        onBlur={() => setTimeout(() => setIsThanaOpen(false), 200)}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, thana: e.target.value });
                          if (['Dhaka', 'Gazipur', 'Narayanganj'].includes(district)) {
                            setIsThanaOpen(true);
                          }
                        }}
                        className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans pr-10"
                      />
                      {['Dhaka', 'Gazipur', 'Narayanganj'].includes(district) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    {isThanaOpen && ['Dhaka', 'Gazipur', 'Narayanganj'].includes(district) && (
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-gold/30 rounded-sm z-50 py-1 shadow-2xl divide-y divide-white/5 scrollbar-thin">
                        {(DISTRICT_THANAS[district] || [])
                          .filter(t => t.name.toLowerCase().includes((thana || '').toLowerCase()))
                          .map((t) => (
                            <button
                              key={t.name}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setShippingInfo({ ...shippingInfo, thana: t.name });
                                setIsThanaOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-zinc-300 hover:text-white hover:bg-gold/20 text-xs transition-colors font-sans cursor-pointer"
                            >
                              {t.name}
                            </button>
                          ))}
                        {(DISTRICT_THANAS[district] || []).filter(t => t.name.toLowerCase().includes((thana || '').toLowerCase())).length === 0 && (
                          <div className="px-4 py-2 text-zinc-500 text-xs font-sans">
                            No thanas found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ship to Different Address Checkbox */}
                {paymentMethod !== 'instore' && (
                  <div className="pt-4 border-t border-white/10">
                    <label className="flex items-center gap-3 text-xs text-zinc-200 font-sans cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!sameAsBilling}
                        onChange={(e) => setSameAsBilling(!e.target.checked)}
                        className="h-4.5 w-4.5 rounded-[3px] border border-gold/40 bg-black text-gold focus:ring-gold accent-gold cursor-pointer"
                      />
                      <span className="font-semibold text-gold uppercase tracking-wider text-[11px]">
                        Ship to a different address?
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Conditional Shipping Address Section */}
              {paymentMethod !== 'instore' && !sameAsBilling && (
                <div className="space-y-6 bg-zinc-950/80 p-6 border border-gold/25 rounded-sm animate-fade-in">
                  <div className="border-b border-white/10 pb-3">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gold" /> Shipping Address Details
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                      Specify where the courier should deliver your parcel.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Recipient Full Name */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                        Recipient Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required={!sameAsBilling}
                        placeholder=""
                        value={shipFullName || ''}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 focus:border-gold text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                      />
                    </div>

                    {/* Recipient Phone Number */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                        Recipient Phone Number <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required={!sameAsBilling}
                        placeholder="+8801712345678"
                        value={shipPhone || ''}
                        onChange={(e) => handleShippingPhoneChange(e.target.value)}
                        onBlur={(e) => setShipPhoneError(validatePhoneValue(e.target.value))}
                        className={`w-full bg-black/50 border ${shipPhoneError ? 'border-rose-500' : 'border-white/15'} focus:border-gold text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans`}
                      />
                      {shipPhoneError && <p className="mt-1.5 text-[10px] text-rose-400">{shipPhoneError}</p>}
                    </div>

                    {/* Shipping Street Address */}
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                        Shipping Street Address
                      </label>
                      <input
                        type="text"
                        placeholder=""
                        value={shipAddress}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className="w-full bg-black/50 border border-white/15 focus:border-gold text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans"
                      />
                    </div>

                    {/* Shipping Thana */}
                    {/* Shipping District */}
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                        Shipping District <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={!sameAsBilling}
                          placeholder="Select Shipping District"
                          value={shipDistrict}
                          onFocus={() => setIsShipDistrictOpen(true)}
                          onBlur={() => setTimeout(() => setIsShipDistrictOpen(false), 200)}
                          onChange={(e) => {
                            setShippingAddress({ ...shippingAddress, district: e.target.value, thana: '' });
                            setIsShipDistrictOpen(true);
                          }}
                          className="w-full bg-black/50 border border-white/15 focus:border-gold text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans pr-10"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                      {isShipDistrictOpen && (
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-gold/30 rounded-sm z-50 py-1 shadow-2xl divide-y divide-white/5 scrollbar-thin">
                          {[...districtData]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .filter(d => d.name.toLowerCase().includes((shipDistrict || '').toLowerCase()))
                            .map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setShippingAddress({ ...shippingAddress, district: d.name, thana: '' });
                                  setIsShipDistrictOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-zinc-300 hover:text-white hover:bg-gold/20 text-xs transition-colors font-sans cursor-pointer"
                              >
                                {d.name}
                              </button>
                            ))}
                          {districtData.filter(d => d.name.toLowerCase().includes((shipDistrict || '').toLowerCase())).length === 0 && (
                            <div className="px-4 py-2 text-zinc-500 text-xs font-sans">
                              No districts found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shipping Thana */}
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-300 block mb-1.5 font-semibold">
                        Shipping Thana / Upazila {['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict) && <span className="text-rose-400">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict) && !sameAsBilling}
                          placeholder={['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict) ? "Select or type Thana" : "Enter Thana / Upazila"}
                          value={shipThana}
                          onFocus={() => {
                            if (['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict)) {
                              setIsShipThanaOpen(true);
                            }
                          }}
                          onBlur={() => setTimeout(() => setIsShipThanaOpen(false), 200)}
                          onChange={(e) => {
                            setShippingAddress({ ...shippingAddress, thana: e.target.value });
                            if (['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict)) {
                              setIsShipThanaOpen(true);
                            }
                          }}
                          className="w-full bg-black/50 border border-white/15 focus:border-gold text-zinc-200 text-xs px-4 py-3 outline-none rounded-sm font-sans pr-10"
                        />
                        {['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict) && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {isShipThanaOpen && ['Dhaka', 'Gazipur', 'Narayanganj'].includes(shipDistrict) && (
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-zinc-950 border border-gold/30 rounded-sm z-50 py-1 shadow-2xl divide-y divide-white/5 scrollbar-thin">
                          {(DISTRICT_THANAS[shipDistrict] || [])
                            .filter(t => t.name.toLowerCase().includes((shipThana || '').toLowerCase()))
                            .map((t) => (
                              <button
                                key={t.name}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setShippingAddress({ ...shippingAddress, thana: t.name });
                                  setIsShipThanaOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-zinc-300 hover:text-white hover:bg-gold/20 text-xs transition-colors font-sans cursor-pointer"
                              >
                                {t.name}
                              </button>
                            ))}
                          {(DISTRICT_THANAS[shipDistrict] || []).filter(t => t.name.toLowerCase().includes((shipThana || '').toLowerCase())).length === 0 && (
                            <div className="px-4 py-2 text-zinc-500 text-xs font-sans">
                              No thanas found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Charge Section (Disabled radios, auto-selected based on District) */}
              <div className="space-y-4 bg-luxury-dark/10 p-6 border border-white/10 rounded-sm">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gold" /> Delivery Charge
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    Shipping fee is automatically calculated based on your selected District.
                  </p>
                </div>

                {(() => {
                  const activeDistrict = (sameAsBilling ? (district || '') : (shipDistrict || '')).trim().toLowerCase();
                  const isDhaka = activeDistrict === 'dhaka' || activeDistrict.includes('dhaka');

                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Option 1: Inside Dhaka */}
                        <div
                          className={`p-3.5 rounded-sm border flex items-center justify-between transition-all ${
                            shippingFee === 80 && paymentMethod !== 'instore'
                              ? 'border-gold bg-gold/15 text-gold font-bold shadow-md'
                              : 'border-white/10 bg-black/40 text-zinc-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="shippingChargeOption"
                              disabled
                              checked={shippingFee === 80 && paymentMethod !== 'instore'}
                              readOnly
                              className="h-4 w-4 accent-gold cursor-not-allowed"
                            />
                            <div className="text-left">
                              <span className="text-xs font-sans block font-semibold uppercase tracking-wider">Inside Dhaka</span>
                              <span className="text-[10px] font-sans text-zinc-400 block">24 – 48 Hours</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-gold">৳80</span>
                        </div>

                        {/* Option 2: Dhaka Suburbs */}
                        <div
                          className={`p-3.5 rounded-sm border flex items-center justify-between transition-all ${
                            shippingFee === 100 && paymentMethod !== 'instore'
                              ? 'border-gold bg-gold/15 text-gold font-bold shadow-md'
                              : 'border-white/10 bg-black/40 text-zinc-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="shippingChargeOption"
                              disabled
                              checked={shippingFee === 100 && paymentMethod !== 'instore'}
                              readOnly
                              className="h-4 w-4 accent-gold cursor-not-allowed"
                            />
                            <div className="text-left">
                              <span className="text-xs font-sans block font-semibold uppercase tracking-wider">Dhaka Suburbs</span>
                              <span className="text-[10px] font-sans text-zinc-400 block">24 – 72 Hours</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-gold">৳100</span>
                        </div>

                        {/* Option 3: Outside Dhaka */}
                        <div
                          className={`p-3.5 rounded-sm border flex items-center justify-between transition-all ${
                            shippingFee === 120 && paymentMethod !== 'instore'
                              ? 'border-gold bg-gold/15 text-gold font-bold shadow-md'
                              : 'border-white/10 bg-black/40 text-zinc-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="shippingChargeOption"
                              disabled
                              checked={shippingFee === 120 && paymentMethod !== 'instore'}
                              readOnly
                              className="h-4 w-4 accent-gold cursor-not-allowed"
                            />
                            <div className="text-left">
                              <span className="text-xs font-sans block font-semibold uppercase tracking-wider">Outside Dhaka</span>
                              <span className="text-[10px] font-sans text-zinc-400 block">48 – 72 Hours</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-gold">৳120</span>
                        </div>
                      </div>

                      {paymentMethod === 'instore' && (
                        <div className="text-[11px] text-amber-300 font-sans italic bg-amber-950/30 p-2.5 border border-amber-500/20 rounded-sm">
                          Office Pickup selected.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Order Notes Section */}
              <div className="space-y-3 bg-zinc-900/90 p-6 border border-zinc-700/60 rounded-sm shadow-xl">
                <label className="block text-xs font-sans font-bold uppercase tracking-widest text-gold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gold" />
                    <span>Order Notes</span>
                  </span>
                  <span className="text-zinc-500 font-normal lowercase text-[10px]">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={shippingInfo.notes || ''}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                  placeholder="Notes about your order, e.g. special instructions for delivery or fragrance preferences..."
                  className="w-full bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 text-xs font-sans text-zinc-200 p-3.5 rounded-sm outline-none transition-all placeholder:text-zinc-500 resize-y"
                />
              </div>

              {/* New Customer Banner */}
              {!user && (
                <div className="bg-zinc-900/90 border border-zinc-700/60 p-6 rounded-sm space-y-3 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-luxury-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold shrink-0" />
                        <span>New Customer?</span>
                      </h4>
                      <p className="text-xs text-zinc-300 font-sans font-light leading-relaxed">
                        Create an account to enjoy discounts & offers on your purchases.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAuthModal(true, 'register')}
                      className="bg-gold hover:bg-gold/80 text-black px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-all shadow-md shrink-0 cursor-pointer text-center"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Payment Method Selection & Order Summary Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Method Selection on Right Side */}
              <div className="bg-zinc-900/90 border border-zinc-700/60 p-6 rounded-sm space-y-5 shadow-xl">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gold border-b border-zinc-800 pb-3 flex items-center gap-2">
                  Payment Method Selection
                </h3>

                {/* 3 Main Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* COD Option */}
                  <label className={`cursor-pointer rounded-sm border p-3 text-[10px] uppercase tracking-wider font-semibold text-center flex flex-col items-center justify-center min-h-[52px] transition-all ${
                    paymentMethod === 'cod' ? 'border-gold bg-gold/15 text-gold font-bold shadow-md' : 'border-zinc-700/60 bg-zinc-800/80 text-zinc-300 hover:border-gold/40'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <span>Cash on Delivery</span>
                  </label>

                  {/* Pickup Option */}
                  <label className={`cursor-pointer rounded-sm border p-3 text-[10px] uppercase tracking-wider font-semibold text-center flex flex-col items-center justify-center min-h-[52px] transition-all ${
                    paymentMethod === 'instore' ? 'border-gold bg-gold/15 text-gold font-bold shadow-md' : 'border-zinc-700/60 bg-zinc-800/80 text-zinc-300 hover:border-gold/40'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instore"
                      checked={paymentMethod === 'instore'}
                      onChange={() => setPaymentMethod('instore')}
                      className="sr-only"
                    />
                    <span>In-Store Pickup</span>
                  </label>

                  {/* Other Payment Methods */}
                  <label className={`cursor-pointer rounded-sm border p-3 text-[10px] uppercase tracking-wider font-semibold text-center flex flex-col items-center justify-center min-h-[52px] transition-all ${
                    ['bkash', 'nagad', 'bank_transfer', 'other'].includes(paymentMethod)
                      ? 'border-gold bg-gold/20 text-gold font-bold shadow-md ring-1 ring-gold/40'
                      : 'border-zinc-700/60 bg-zinc-800/80 text-zinc-300 hover:border-gold/40'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="other"
                      checked={['bkash', 'nagad', 'bank_transfer', 'other'].includes(paymentMethod)}
                      onChange={() => {
                        if (!['bkash', 'nagad', 'bank_transfer'].includes(paymentMethod)) {
                          setPaymentMethod('bkash');
                        }
                      }}
                      className="sr-only"
                    />
                    <span>Other payment methods</span>
                  </label>
                </div>

                {/* Info for Cash On Delivery */}
                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-zinc-800/90 border border-zinc-700/80 rounded-sm space-y-3 text-xs font-sans text-zinc-200 text-left">
                    <div className="border-b border-white/10 pb-2">
                      <h4 className="font-bold text-gold text-xs">Disclaimer: Please read carefully before placing your order.</h4>
                    </div>

                    <div className="space-y-2 text-[11px] text-zinc-300 leading-relaxed font-sans">
                      <div>
                        <p className="font-semibold text-zinc-100">1. For orders up to ৳3,000 – Inside Dhaka:</p>
                        <p className="text-zinc-400">Cash on Delivery (COD) is available. No advance required.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-zinc-100">2. For orders up to ৳3,000 – Outside Dhaka:</p>
                        <p className="text-zinc-400">Delivery charge of ৳120 must be paid in advance to confirm the order.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-zinc-100">3. For orders above ৳3,000 – Inside or Outside Dhaka:</p>
                        <p className="text-zinc-400">An advance payment of 10% of the total amount is required to confirm the order.</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-zinc-300 font-sans">
                      <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span>✅ Send your advance payment via:</span>
                      </p>
                      <div className="space-y-0.5 text-zinc-300 font-sans pl-1">
                        <div>bKash: <strong className="font-mono text-pink-300">01996 502866</strong> (Send Money)</div>
                        <div>Nagad: <strong className="font-mono text-orange-300">01869 151550</strong> (Send Money)</div>
                        <div>Bank Transfer: <span className="text-zinc-400">(See bank details above)</span></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-zinc-300 font-sans">
                      <p className="font-bold text-gold flex items-center gap-1.5">
                        <span>📌 Advance Payment Confirmation:</span>
                      </p>
                      <p className="text-zinc-300">Please confirm your advance payment by either:</p>
                      <ul className="space-y-0.5 text-zinc-400 pl-1">
                        <li>– Entering the Transaction ID in the designated box on the checkout page, or</li>
                        <li>– Sending us a message via our Facebook or Instagram page.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Info for In-Store Pickup */}
                {paymentMethod === 'instore' && (
                  <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-sm space-y-2 text-left">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Store className="w-4 h-4 text-amber-400" /> Office Pickup Instruction
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-amber-200/90 font-sans leading-relaxed">
                      <PhoneCall className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Before visiting our office for pickup please call us to confirm product availability & stock: <a href="tel:+8801869151550" className="underline font-bold text-amber-300">+880 1869-151550</a>
                        <div className="mt-2 text-[11px] text-amber-200">
                          <strong className="text-amber-300">Office Address:</strong> Ground Floor, House 20, Road 10, Sector 13, Uttara, Dhaka
                        </div>
                        <div className="mt-1 text-[11px]">
                          <a href="https://maps.app.goo.gl/33jAhzCYG5gZ8K8y6" target="_blank" rel="noopener noreferrer" className="underline text-amber-300">see in map</a>
                        </div>
                      </span>
                    </div>
                  </div>
                )}

                {/* Sub-options for "Other Payment Methods" */}
                {['bkash', 'nagad', 'bank_transfer', 'other'].includes(paymentMethod) && (
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-zinc-400">
                      Select Payment Provider:
                    </label>

                    <div className="space-y-2">
                      {/* Sub-option 1: Direct bank transfer */}
                      <label className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'bg-black/60 border-gold text-gold font-semibold'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:border-gold/30'
                      }`}>
                        <input
                          type="radio"
                          name="subPaymentMethod"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="accent-gold w-3.5 h-3.5"
                        />
                        <span className="text-xs font-sans">Direct bank transfer</span>
                      </label>

                      {/* Sub-option 2: bKash */}
                      <label className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                        paymentMethod === 'bkash'
                          ? 'bg-pink-950/30 border-pink-500 text-pink-400 font-semibold'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:border-pink-500/30'
                      }`}>
                        <input
                          type="radio"
                          name="subPaymentMethod"
                          value="bkash"
                          checked={paymentMethod === 'bkash'}
                          onChange={() => setPaymentMethod('bkash')}
                          className="accent-pink-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-sans flex items-center gap-2">
                          <span className="bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">bKash</span>
                          <span>bKash</span>
                        </span>
                      </label>

                      {/* Sub-option 3: Nagad */}
                      <label className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${
                        paymentMethod === 'nagad'
                          ? 'bg-orange-950/30 border-orange-500 text-orange-400 font-semibold'
                          : 'bg-black/30 border-white/10 text-zinc-300 hover:border-orange-500/30'
                      }`}>
                        <input
                          type="radio"
                          name="subPaymentMethod"
                          value="nagad"
                          checked={paymentMethod === 'nagad'}
                          onChange={() => setPaymentMethod('nagad')}
                          className="accent-orange-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-sans flex items-center gap-2">
                          <span className="bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">Nagad</span>
                          <span>Nagad</span>
                        </span>
                      </label>
                    </div>

                    {/* Content for Direct bank transfer */}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="p-4 bg-black/60 border border-gold/30 rounded-sm space-y-4 text-xs font-sans text-zinc-200">
                        <div className="space-y-1.5 border-b border-white/10 pb-3">
                          <h4 className="font-bold text-gold text-xs">Bank Payment Instructions — Read Carefully</h4>
                          <ul className="space-y-1 text-zinc-300 text-[11px] leading-relaxed">
                            <li>✓ Pay using NPSB transfer only.</li>
                            <li>✓ Use your Order ID as the payment reference.</li>
                            <li>✓ Orders will be processed after payment is received.</li>
                            <li>✓ Unpaid orders are held for 24 hours max.</li>
                            <li>✓ If any item is out of stock, you can get a full refund.</li>
                          </ul>
                        </div>

                        <div className="space-y-1 text-[11px] bg-white/5 p-3 rounded-sm font-sans border border-white/5">
                          <h5 className="font-bold text-gold text-xs mb-1">Bank Details</h5>
                          <div>Account Name: <strong className="text-white">Saad Ebna Azad</strong></div>
                          <div>Account Number: <strong className="text-white font-mono">2302808015001</strong></div>
                          <div>Bank Name: <strong className="text-white">The City Bank Ltd</strong></div>
                          <div>Branch: <strong className="text-white">Uttara Branch</strong></div>
                          <div>Routing Number: <strong className="text-white font-mono">225264634</strong></div>
                        </div>

                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">Bank Name / Details</label>
                            <input
                              type="text"
                              placeholder=""
                              value={paymentDetails?.bankName || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                              className="w-full bg-black border border-white/15 focus:border-gold text-zinc-200 text-xs px-3 py-2.5 outline-none rounded-sm"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">Bank Account / Reference ID</label>
                            <input
                              type="text"
                              placeholder=""
                              value={paymentDetails?.bankAccountNumber || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, bankAccountNumber: e.target.value })}
                              className="w-full bg-black border border-white/15 focus:border-gold text-zinc-200 text-xs px-3 py-2.5 outline-none rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-gold block mb-1 font-bold flex items-center justify-between">
                              <span>Amount Paid (৳)</span>
                              <span className="text-zinc-500 text-[9px] font-normal lowercase">(for advance payment calculation)</span>
                            </label>
                            <input
                              type="number"
                              placeholder=""
                              value={paymentDetails?.bankAmount || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, bankAmount: e.target.value })}
                              className="w-full bg-black border border-gold/50 focus:border-gold text-gold text-xs px-3 py-2.5 outline-none rounded-sm font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content for bKash */}
                    {paymentMethod === 'bkash' && (
                      <div className="p-4 bg-pink-950/20 border border-pink-500/30 rounded-sm space-y-4 text-xs font-sans text-zinc-200">
                        <div className="space-y-1.5 border-b border-pink-500/20 pb-3">
                          <h4 className="font-bold text-pink-400 text-xs">Disclaimer: Please Read Carefully</h4>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            To confirm your order, send via bKash (Send Money) to the number below:<br />
                            bKash Number: <strong className="text-pink-300 font-mono">01996502866</strong><br />
                            Account Type: Personal
                          </p>
                          <div className="text-[11px] text-zinc-300 leading-relaxed pt-1">
                            <strong>After sending the payment:</strong>
                            <ol className="list-decimal list-inside space-y-0.5 mt-1 text-zinc-300">
                              <li>Enter your bKash number in the Account Number field.</li>
                              <li>Paste the Transaction ID in the Transaction ID field.</li>
                              <li>Click "Place Order" to complete your purchase.</li>
                            </ol>
                            <p className="text-rose-400 text-[10px] mt-1 font-medium">
                              Note: Orders will not be processed without valid payment details.
                            </p>
                          </div>
                          <div className="pt-2 text-xs font-bold text-pink-300 font-mono">
                            bKash Personal Number : 01996502866
                          </div>
                        </div>

                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">bKash Number</label>
                            <input
                              type="tel"
                              placeholder=""
                              value={paymentDetails?.bkashNumber || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, bkashNumber: e.target.value })}
                              className="w-full bg-black border border-pink-500/30 focus:border-pink-500 text-zinc-200 text-xs px-3 py-2.5 outline-none rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">bKash Transaction ID</label>
                            <input
                              type="text"
                              placeholder=""
                              value={paymentDetails?.bkashTxnId || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, bkashTxnId: e.target.value })}
                              className="w-full bg-black border border-pink-500/30 focus:border-pink-500 text-zinc-200 text-xs px-3 py-2.5 outline-none rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-pink-400 block mb-1 font-bold flex items-center justify-between">
                              <span>Amount Paid (৳)</span>
                              <span className="text-zinc-500 text-[9px] font-normal lowercase">(for advance payment calculation)</span>
                            </label>
                            <input
                              type="number"
                              placeholder=""
                              value={paymentDetails?.bkashAmount || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, bkashAmount: e.target.value })}
                              className="w-full bg-black border border-pink-500/50 focus:border-pink-400 text-pink-300 text-xs px-3 py-2.5 outline-none rounded-sm font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content for Nagad */}
                    {paymentMethod === 'nagad' && (
                      <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-sm space-y-4 text-xs font-sans text-zinc-200">
                        <div className="space-y-1.5 border-b border-orange-500/20 pb-3">
                          <h4 className="font-bold text-orange-400 text-xs">Disclaimer: Please Read Carefully</h4>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            To confirm your order, send via Nagad (Send Money) to the number below:<br />
                            Nagad Number: <strong className="text-orange-300 font-mono">01869151550</strong><br />
                            Account Type: Personal
                          </p>
                          <div className="text-[11px] text-zinc-300 leading-relaxed pt-1">
                            <strong>After sending the payment:</strong>
                            <ol className="list-decimal list-inside space-y-0.5 mt-1 text-zinc-300">
                              <li>Enter your Nagad number in the Account Number field.</li>
                              <li>Paste the Transaction ID in the Transaction ID field.</li>
                              <li>Click "Place Order" to complete your purchase.</li>
                            </ol>
                            <p className="text-rose-400 text-[10px] mt-1 font-medium">
                              Note: Orders will not be processed without valid payment details.
                            </p>
                          </div>
                          <div className="pt-2 text-xs font-bold text-orange-300 font-mono">
                            Nagad Personal Number : 01869151550
                          </div>
                        </div>

                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">Nagad Number</label>
                            <input
                              type="tel"
                              placeholder=""
                              value={paymentDetails?.nagadNumber || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, nagadNumber: e.target.value })}
                              className="w-full bg-black border border-orange-500/30 focus:border-orange-500 text-zinc-200 text-xs px-3 py-2.5 outline-none rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1 font-semibold">Nagad Transaction ID</label>
                            <input
                              type="text"
                              placeholder=""
                              value={paymentDetails?.nagadTxnId || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, nagadTxnId: e.target.value })}
                              className="w-full bg-black border border-orange-500/30 focus:border-orange-500 text-zinc-200 text-xs px-3 py-2.5 outline-none rounded-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-orange-400 block mb-1 font-bold flex items-center justify-between">
                              <span>Amount Paid (৳)</span>
                              <span className="text-zinc-500 text-[9px] font-normal lowercase">(for advance payment calculation)</span>
                            </label>
                            <input
                              type="number"
                              placeholder=""
                              value={paymentDetails?.nagadAmount || ''}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, nagadAmount: e.target.value })}
                              className="w-full bg-black border border-orange-500/50 focus:border-orange-400 text-orange-300 text-xs px-3 py-2.5 outline-none rounded-sm font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Coupon / Promo Code Section */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <label className="block text-xs font-sans font-bold uppercase tracking-widest text-gold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gold" />
                      <span>Apply Coupon Code</span>
                    </span>
                    {appliedDiscount > 0 && (
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">
                        ({appliedDiscount * 100}% Applied)
                      </span>
                    )}
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder=""
                      value={promoCode || ''}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-zinc-800/80 border border-zinc-700/80 focus:border-gold/60 text-xs font-mono text-zinc-200 px-3.5 py-2.5 outline-none rounded-sm transition-all uppercase placeholder:normal-case placeholder:text-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      className="bg-gold hover:bg-gold/80 text-black px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-sm transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-rose-400 text-[11px] font-sans font-light flex items-center gap-1.5">
                      <IconAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{promoError}</span>
                    </p>
                  )}

                  {appliedDiscount > 0 && (
                    <p className="text-emerald-400 text-[11px] font-sans font-light flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-sm">
                      <IconCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Coupon applied successfully! You saved <strong>{appliedDiscount * 100}%</strong> on subtotal.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items & Summary Sidebar */}
              <div className="bg-zinc-900/90 border border-zinc-700/60 p-6 rounded-sm space-y-6 shadow-xl">
                <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-4">
                  ORDER SUMMARY
                </h3>

                {/* Product list */}
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <h4 className="font-serif font-light text-zinc-200">{item.product.name}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {item.size} • {item.concentration} • Qty {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono text-gold font-semibold">{fmtBDT(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculations Breakdown */}
                {(() => {
                  let advanceAmount = 0;
                  let advanceMethodName = '';

                  if (paymentMethod === 'bkash') {
                    advanceAmount = parseFloat(paymentDetails?.bkashAmount) || 0;
                    advanceMethodName = 'bKash';
                  } else if (paymentMethod === 'nagad') {
                    advanceAmount = parseFloat(paymentDetails?.nagadAmount) || 0;
                    advanceMethodName = 'Nagad';
                  } else if (paymentMethod === 'bank_transfer') {
                    advanceAmount = parseFloat(paymentDetails?.bankAmount) || 0;
                    advanceMethodName = 'Direct bank transfer';
                  }

                  const totalDue = Math.max(0, cartTotal - advanceAmount);

                  return (
                    <div className="border-t border-white/5 pt-4 space-y-2.5 font-sans text-xs">
                      <div className="flex justify-between text-zinc-400 font-light">
                        <span>Subtotal</span>
                        <span className="font-mono text-zinc-300">{fmtBDT(cartSubtotal)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400 font-light">
                          <span>Discount</span>
                          <span className="font-mono">-{fmtBDT(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-zinc-400 font-light">
                        <span>Delivery Charge</span>
                        <span className="font-mono text-zinc-300">
                          {paymentMethod === 'instore' ? 'Complimentary (৳0)' : fmtBDT(shippingFee)}
                        </span>
                      </div>

                      <div className="border-t border-gold/20 pt-3 flex justify-between items-end">
                        <span className="text-xs font-sans font-bold uppercase text-zinc-300 tracking-wider">Total Charge</span>
                        <span className="text-base font-serif text-gold font-semibold font-mono">{fmtBDT(cartTotal)}</span>
                      </div>

                      {advanceAmount > 0 && (
                        <>
                          <div className="flex justify-between text-emerald-400 text-xs font-sans pt-1">
                            <span>Advance payment ({advanceMethodName})</span>
                            <span className="font-mono">-{fmtBDT(advanceAmount)}</span>
                          </div>

                          <div className="border-t border-gold/40 pt-3 flex justify-between items-end bg-gold/10 p-3 rounded-sm">
                            <span className="text-xs font-sans font-bold uppercase text-gold tracking-wider">Total Due</span>
                            <span className="text-lg font-serif text-gold font-bold font-mono">{fmtBDT(totalDue)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Confirm Order Button on the Right Side */}
              <div className="pt-2 space-y-4">
                {/* Privacy Policy and Terms Agreement */}
                <div className="space-y-3 text-left border-t border-white/10 pt-4">
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <Link to="/privacy-policy" className="underline text-zinc-300 hover:text-gold transition-colors">privacy policy</Link>.
                  </p>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans text-zinc-200">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      required
                      className="mt-0.5 accent-gold w-4 h-4 cursor-pointer shrink-0"
                    />
                    <span className="leading-snug">
                      I have read and agree to the website <Link to="/terms-and-condition" className="underline text-zinc-200 hover:text-gold font-medium">terms and conditions</Link> <span className="text-rose-400 font-bold">*</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingOrder}
                  className="w-full bg-gold text-black text-xs font-sans font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-gold/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessingOrder ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin text-black" />
                      PROCESSING ORDER LEDGER...
                    </>
                  ) : (
                    <>
                      {(() => {
                        let adv = 0;
                        if (paymentMethod === 'bkash') adv = parseFloat(paymentDetails?.bkashAmount) || 0;
                        else if (paymentMethod === 'nagad') adv = parseFloat(paymentDetails?.nagadAmount) || 0;
                        else if (paymentMethod === 'bank_transfer') adv = parseFloat(paymentDetails?.bankAmount) || 0;

                        const due = Math.max(0, cartTotal - adv);
                        return adv > 0 ? `CONFIRM ORDER — DUE: ${fmtBDT(due)}` : `CONFIRM ORDER — ${fmtBDT(cartTotal)}`;
                      })()}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 sm:gap-6 text-[10px] text-zinc-500 font-sans font-medium py-1">
                  <span className="flex items-center gap-1.5">
                    <IconShield className="w-4 h-4 text-gold/60" /> SSL SECURED
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <IconLock className="w-3.5 h-3.5 text-gold/60" /> 256-BIT ENCRYPTION
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <IconAward className="w-4 h-4 text-gold/60" /> INSURED COURIER
                  </span>
                </div>
              </div>

            </div>

          </div>
        </form>

        {/* Return & Refund Policy Section */}
        <div className="mt-16 border-t border-gold/15 pt-12 space-y-10">
          
          {/* Top Card: Important Note */}
          <div className="max-w-4xl mx-auto bg-zinc-900/95 border border-amber-500/40 p-6 sm:p-8 rounded-sm text-center space-y-3 shadow-2xl">
            <h3 className="text-amber-400 font-sans font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>Important Note</span>
            </h3>
            <p className="text-zinc-200 text-xs sm:text-sm font-sans font-medium leading-relaxed max-w-2xl mx-auto">
              If you are unsure about a fragrance, we highly recommend trying a 2ml tester first before purchasing a larger size.
            </p>
            <p className="text-zinc-400 text-xs font-sans font-light leading-relaxed max-w-3xl mx-auto pt-1 border-t border-zinc-800">
              Please note that disliking a perfume’s scent profile is not considered a valid reason for return or refund. Fragrance preference is subjective and may vary from person to person.
            </p>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-luxury-white tracking-wide uppercase">
              Return & Refund Policy
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light">
              Please read carefully before placing your order.
            </p>
          </div>

          {/* 3 Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-2">
            {/* Column 1: When Your Parcel Arrives */}
            <div className="p-6 bg-zinc-900/90 border border-zinc-700/60 hover:border-gold/40 rounded-sm space-y-4 shadow-xl transition-all">
              <h3 className="text-sm font-serif font-semibold text-gold tracking-wider border-b border-zinc-800 pb-3">
                When Your Parcel Arrives
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300 font-sans font-light list-disc list-inside leading-relaxed">
                <li>Please record a clear unboxing video</li>
                <li>Start recording before opening the outer packaging</li>
                <li>The video must clearly show the sealed package being opened</li>
                <li className="text-amber-300 font-medium">An unboxing video is mandatory for any damage or missing item claim</li>
              </ul>
            </div>

            {/* Column 2: Eligible for Return / Refund */}
            <div className="p-6 bg-zinc-900/90 border border-zinc-700/60 hover:border-gold/40 rounded-sm space-y-4 shadow-xl transition-all">
              <h3 className="text-sm font-serif font-semibold text-gold tracking-wider border-b border-zinc-800 pb-3">
                Eligible for Return / Refund
              </h3>
              <div className="space-y-3 text-xs text-zinc-300 font-sans font-light leading-relaxed">
                <p>
                  Returns or refunds are accepted only if the issue occurs from our side, such as:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-200 pl-1 font-medium">
                  <li>Broken bottle</li>
                  <li>Leakage during delivery</li>
                  <li>Incorrect item sent</li>
                </ul>
              </div>
            </div>

            {/* Column 3: How to Report */}
            <div className="p-6 bg-zinc-900/90 border border-zinc-700/60 hover:border-gold/40 rounded-sm space-y-4 shadow-xl transition-all">
              <h3 className="text-sm font-serif font-semibold text-gold tracking-wider border-b border-zinc-800 pb-3">
                How to Report
              </h3>
              <div className="space-y-3 text-xs text-zinc-300 font-sans font-light leading-relaxed">
                <p>
                  Please report the issue within <strong>24 hours</strong> of delivery with the unboxing video.
                </p>
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <p className="text-zinc-400">After verification, you may choose one of the following:</p>
                  <ul className="list-disc list-inside space-y-1 text-gold font-medium pl-1">
                    <li>Replacement</li>
                    <li>Full Refund</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Checkout;
