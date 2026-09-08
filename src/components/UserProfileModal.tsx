"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { countries } from '../data/countries';
import { useSession } from 'next-auth/react';


interface SavedPayoutMethod {
  id: string;
  methodName: string;
  isPreferred: boolean;
  details: { [key: string]: string };
}

export default function UserProfileModal() {
  const { userRole, userProfile, updateUserProfile } = useApp();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Email Login, 2: Profile Details
  
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.name === 'India') || countries[0]);
  const [gender, setGender] = useState('Male');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');

  // Multiple Payout Methods States
  const [savedPayoutMethods, setSavedPayoutMethods] = useState<SavedPayoutMethod[]>([]);
  const [showAddPayoutForm, setShowAddPayoutForm] = useState(false);
  const [newPayoutDetails, setNewPayoutDetails] = useState<{ [key: string]: string }>({});

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [dynamicMethods, setDynamicMethods] = useState<{ value: string; label: string; placeholder: string; fields?: string | any[]; placeholderType?: string }[]>([]);

  // Automatically trigger profile setup if logged in as 'user' but no profile exists
  useEffect(() => {
    // Disabled automatic popup to allow inline editing on My Account page
  }, [userRole, userProfile, session]);

  // Listen to a custom event to open the modal from other components (like Header)
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      if (userProfile) {
        // Edit mode
        setEmail(userProfile.email);
        setFullName(userProfile.fullName);
        setGender(userProfile.gender);
        
        // Parse dial code and phone number
        const savedPhone = userProfile.phone || '';
        const savedCountry = userProfile.country || '';
        const savedPaymentDetails = userProfile.paymentDetails || '';
        const savedPaymentMethod = userProfile.paymentMethod || '';
        setPaymentDetails(savedPaymentDetails);
        setPayoutMethod(savedPaymentMethod);
        
        let methodsList: SavedPayoutMethod[] = [];
        if (savedPaymentDetails.trim().startsWith('[')) {
          try {
            methodsList = JSON.parse(savedPaymentDetails);
          } catch (e) {
            methodsList = [];
          }
        } else if (savedPaymentDetails) {
          methodsList = [{
            id: 'legacy-1',
            methodName: savedPaymentMethod || 'Payment Method',
            isPreferred: true,
            details: { details: savedPaymentDetails }
          }];
        }
        setSavedPayoutMethods(methodsList);
        let matchingCountry = countries.find(c => c.name === savedCountry);
        if (!matchingCountry) {
          matchingCountry = countries.find(c => savedPhone.startsWith(c.code));
        }
        if (matchingCountry) {
          setSelectedCountry(matchingCountry);
          setPhone(savedPhone.replace(matchingCountry.code, '').trim());
        } else {
          setPhone(savedPhone);
        }
        setStep(2);
      } else {
        setStep(1);
      }
    };

    window.addEventListener('open-profile-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-profile-modal', handleOpenModal);
    };
  }, [userProfile]);

  // Fetch available payout methods whenever country changes
  useEffect(() => {
    let active = true;
    async function fetchMethods() {
      try {
        const res = await fetch(`/api/payment-methods?country=${encodeURIComponent(selectedCountry.name)}`);
        if (!res.ok) throw new Error('Failed to fetch payment methods');
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          value: item.name,
          label: item.label,
          placeholder: item.placeholder,
          fields: item.fields,
          placeholderType: item.placeholderType
        }));
        
        if (active) {
          setDynamicMethods(mapped);
          if (mapped.length > 0 && !mapped.some((m: any) => m.value === payoutMethod)) {
            setPayoutMethod(mapped[0].value);
          }
        }
      } catch (err) {
        console.warn('Could not load remote payment methods, using defaults:', err);
        if (active) {
          const fallback = selectedCountry.name === 'India'
            ? [
                { value: 'UPI ID', label: '🇮🇳 UPI ID (GPay / PhonePe / BHIM)', placeholder: 'e.g. name@okhdfcbank' },
                { value: 'Paytm Wallet Number', label: '📲 Paytm Wallet Mobile Number', placeholder: 'e.g. 9876543210' },
                { value: 'Bank Transfer (India)', label: '🏦 Bank Account (A/C & IFSC)', placeholder: 'e.g. Account: 12345678, IFSC: SBIN000123' }
              ]
            : [
                { value: 'PayPal Email', label: '💳 PayPal Email', placeholder: 'e.g. billing@paypal.com' },
                { value: 'Crypto Wallet (USDT/USDC)', label: '🪙 Crypto Wallet Address (USDT/USDC)', placeholder: 'e.g. TRC20 or BEP20 address' },
                { value: 'Bank Transfer (International)', label: '🏦 Bank Wire (IBAN & SWIFT)', placeholder: 'e.g. IBAN: GB29..., SWIFT: MIDL...' }
              ];
          setDynamicMethods(fallback);
          if (fallback.length > 0 && !fallback.some((m: any) => m.value === payoutMethod)) {
            setPayoutMethod(fallback[0].value);
          }
        }
      }
    }
    fetchMethods();
    return () => {
      active = false;
    };
  }, [selectedCountry.name]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handleAddPayoutMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutMethod) return;
    
    const selectedMethod = dynamicMethods.find(m => m.value === payoutMethod);
    if (!selectedMethod) return;
    
    const parsedFields = selectedMethod.fields 
      ? (typeof selectedMethod.fields === 'string' ? JSON.parse(selectedMethod.fields) : selectedMethod.fields) 
      : null;
      
    const details: { [key: string]: string } = {};
    
    if (parsedFields && parsedFields.length > 0) {
      // Validate dynamic fields
      for (const field of parsedFields) {
        const val = newPayoutDetails[field.label] || '';
        if (!val.trim()) {
          alert(`Please fill in the ${field.label}`);
          return;
        }
        details[field.label] = val.trim();
      }
    } else {
      // Validate standard single input
      const val = paymentDetails || '';
      if (!val.trim()) {
        alert('Please fill in your payment details.');
        return;
      }
      details['details'] = val.trim();
    }
    
    // Add to list, make preferred if it's the first one
    const newMethod: SavedPayoutMethod = {
      id: `payout-method-${Date.now()}`,
      methodName: payoutMethod,
      isPreferred: savedPayoutMethods.length === 0,
      details
    };
    
    setSavedPayoutMethods([...savedPayoutMethods, newMethod]);
    setShowAddPayoutForm(false);
    setNewPayoutDetails({});
    setPaymentDetails('');
  };

  const handleDeletePayoutMethod = (id: string) => {
    const updated = savedPayoutMethods.filter(m => m.id !== id);
    // If we deleted the preferred one, set the first remaining one as preferred
    if (savedPayoutMethods.find(m => m.id === id)?.isPreferred && updated.length > 0) {
      updated[0].isPreferred = true;
    }
    setSavedPayoutMethods(updated);
  };

  const handleSetPreferredPayoutMethod = (id: string) => {
    setSavedPayoutMethods(
      savedPayoutMethods.map(m => ({
        ...m,
        isPreferred: m.id === id
      }))
    );
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{8,12}$/.test(phone.replace(/[\s-+]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Save profile details
    updateUserProfile({
      fullName,
      email,
      phone: `${selectedCountry.code} ${phone.trim()}`,
      gender,
      country: selectedCountry.name,
      paymentMethod: '',
      paymentDetails: ''
    });

    // Close and reset
    setIsOpen(false);
    setStep(1);
    setErrors({});
  };

  const handleClose = () => {
    // If they are on a partner route and don't have a profile, we don't let them close without submitting or they will get access denied anyway
    const isPartnerRoute = window.location.pathname.startsWith('/partner');
    if (isPartnerRoute && !userProfile) {
      // Go back to home page if they cancel
      window.location.href = '/';
      return;
    }
    setIsOpen(false);
  };

  return (
    <div className="profile-modal-overlay">
      <div className="glass-card profile-modal-card">
        <button className="close-modal-btn" onClick={handleClose}>×</button>
        
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="modal-form-flow">
            <div className="modal-header-sec">
              <span className="modal-icon-badge">🔐</span>
              <h2>Sign In</h2>
              <p>Enter your email to verify your identity and access your dashboard.</p>
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-email">Email Address</label>
              <input 
                id="modal-email"
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'input-error' : ''}
                autoFocus
              />
              {errors.email && <span className="error-text-msg">{errors.email}</span>}
            </div>

            <button type="submit" className="glow-btn-purple submit-modal-btn">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitProfile} className="modal-form-flow">
            <div className="modal-header-sec">
              <span className="modal-icon-badge">👤</span>
              <h2>Complete Profile</h2>
              <p>Please provide a few additional details to personalize your account.</p>
            </div>

            <div className="form-group-field">
              <label>Email Address (Verified)</label>
              <input 
                type="email" 
                value={email}
                disabled
                className="input-disabled"
              />
              <span className="field-hint-msg">Provided during login step</span>
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-fullName">Full Name</label>
              <input 
                id="modal-fullName"
                type="text" 
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={errors.fullName ? 'input-error' : ''}
                autoFocus
              />
              {errors.fullName && <span className="error-text-msg">{errors.fullName}</span>}
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-country">Country</label>
              <select 
                id="modal-country"
                value={selectedCountry.name}
                onChange={(e) => {
                  const country = countries.find(c => c.name === e.target.value);
                  if (country) setSelectedCountry(country);
                }}
                className="country-select"
                style={{ width: '100%' }}
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-phone">Phone Number</label>
              <div className="phone-input-container">
                <div className="phone-prefix-badge" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  userSelect: 'none'
                }}>
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                </div>
                <input 
                  id="modal-phone"
                  type="tel" 
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? 'input-error' : ''}
                  style={{ flex: 1 }}
                />
              </div>
              {errors.phone && <span className="error-text-msg">{errors.phone}</span>}
            </div>


            <div className="form-group-field">
              <label>Gender</label>
              <div className="gender-selector-group">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`gender-option-btn ${gender === g ? 'active' : ''}`}
                    onClick={() => setGender(g)}
                  >
                    {g === 'Male' ? '🙋‍♂️ Male' : g === 'Female' ? '🙋‍♀️ Female' : g === 'Other' ? '👤 Other' : '🔒 Private'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="offerwall-btn" 
                style={{ flex: 1 }}
                disabled={!!userProfile} // Can't go back to email edit if already logged in and just updating details
              >
                Back
              </button>
              <button type="submit" className="glow-btn-purple submit-modal-btn" style={{ flex: 2, marginTop: 0 }}>
                {userProfile ? 'Update Settings' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }
        .profile-modal-card {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-premium), 0 20px 40px rgba(0,0,0,0.4);
          position: relative;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        /* Custom scrollbar for modal card */
        .profile-modal-card::-webkit-scrollbar {
          width: 6px;
        }
        .profile-modal-card::-webkit-scrollbar-track {
          background: transparent;
        }
        .profile-modal-card::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        .profile-modal-card::-webkit-scrollbar-thumb:hover {
          background: var(--accent-indigo);
        }
        .close-modal-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px 8px;
          line-height: 1;
        }
        .close-modal-btn:hover {
          color: var(--text-primary);
        }
        .modal-form-flow {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .modal-header-sec {
          text-align: center;
          margin-bottom: 8px;
        }
        .modal-icon-badge {
          font-size: 2.2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.1);
          margin-bottom: 16px;
          border: 1px solid rgba(79, 70, 229, 0.15);
        }
        .modal-header-sec h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .modal-header-sec p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group-field label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group-field input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-size: 0.92rem;
          transition: all 0.2s;
        }
        .form-group-field input:focus {
          outline: none;
          border-color: var(--accent-indigo);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }
        .phone-input-container {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .country-select {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 12px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-size: 0.92rem;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .country-select:focus {
          border-color: var(--accent-indigo);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }
        .country-select option {
          background: var(--bg-card);
          color: var(--text-primary);
        }
        .form-group-field input.input-disabled {
          background: rgba(255, 255, 255, 0.01) !important;
          color: var(--text-muted) !important;
          border-style: dashed;
          cursor: not-allowed;
        }
        .input-error {
          border-color: rgba(239, 68, 68, 0.5) !important;
        }
        .error-text-msg {
          font-size: 0.78rem;
          color: #ef4444;
          margin-top: 2px;
          font-weight: 500;
        }
        .field-hint-msg {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .gender-selector-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
        }
        .gender-option-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .gender-option-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
          background: var(--bg-card-hover);
        }
        .gender-option-btn.active {
          border-color: var(--accent-indigo);
          color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.08);
          font-weight: 600;
        }
        .submit-modal-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          margin-top: 8px;
          border: none;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
