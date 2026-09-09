"use client";

import React, { useState, useEffect } from 'react';
import { countries } from '../../../data/countries';

interface PaymentMethod {
  id: number;
  name: string;
  label: string;
  placeholder: string;
  targetCountry: string;
  isActive: boolean;
  fields?: string | any[];
  placeholderType?: string;
}

export default function PaymentOptionsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [newCountry, setNewCountry] = useState('India');
  const [newName, setNewName] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newPlaceholderType, setNewPlaceholderType] = useState('text');
  const [customFields, setCustomFields] = useState<{ label: string; placeholder: string; type: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addCustomField = () => {
    setCustomFields([...customFields, { label: '', placeholder: '', type: 'text' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, key: 'label' | 'placeholder' | 'type', value: string) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  // Search dropdown states
  const [countrySearch, setCountrySearch] = useState('India');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Min withdrawal threshold (INR)
  const [minWithdrawal, setMinWithdrawal] = useState(100);

  useEffect(() => {
    // Load local storage threshold
    const saved = localStorage.getItem('eb_admin_payment_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.minWithdrawal !== undefined) setMinWithdrawal(parsed.minWithdrawal);
      } catch (e) {}
    }
    
    fetchMethods();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      }
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMinWithdrawalChange = (val: number) => {
    setMinWithdrawal(val);
    const saved = localStorage.getItem('eb_admin_payment_settings') || '{}';
    try {
      const parsed = JSON.parse(saved);
      parsed.minWithdrawal = val;
      localStorage.setItem('eb_admin_payment_settings', JSON.stringify(parsed));
    } catch (e) {
      localStorage.setItem('eb_admin_payment_settings', JSON.stringify({ minWithdrawal: val }));
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: method.id, isActive: !method.isActive })
      });
      if (res.ok) {
        fetchMethods();
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleDeleteMethod = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchMethods();
      }
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLabel.trim() || !newPlaceholder.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          label: newLabel.trim(),
          placeholder: newPlaceholder.trim(),
          targetCountry: newCountry,
          isActive: true,
          fields: customFields.length > 0 ? customFields : null,
          placeholderType: newPlaceholderType
        })
      });
      if (res.ok) {
        setNewName('');
        setNewLabel('');
        setNewPlaceholder('');
        setNewPlaceholderType('text');
        setNewCountry('India');
        setCountrySearch('India');
        setCustomFields([]);
        fetchMethods();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add payment method');
      }
    } catch (err) {
      console.error('Failed to add payment method:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter countries list by search text
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="admin-content-card">
      <div className="card-header-section">
        <h2 className="card-heading">Gateway Provider Switcher</h2>
        <p className="card-subheading">Control active payment methods per country available for earners requesting withdrawals.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left column: Add Method and Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <form onSubmit={handleAddMethod} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Add Payout Option</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }} ref={dropdownRef}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Country</label>
              <input 
                type="text"
                value={countrySearch}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search target country..."
                style={{ padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem', width: '100%' }}
              />
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  zIndex: 20,
                  marginTop: '4px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  {('global'.includes(countrySearch.toLowerCase()) || countrySearch === '') && (
                    <div 
                      onClick={() => {
                        setNewCountry('Global');
                        setCountrySearch('Global');
                        setIsDropdownOpen(false);
                      }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      🌐 Global (Fallback)
                    </div>
                  )}
                  {filteredCountries.map(c => (
                    <div 
                      key={c.name}
                      onClick={() => {
                        setNewCountry(c.name);
                        setCountrySearch(`${c.flag} ${c.name}`);
                        setIsDropdownOpen(false);
                      }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {c.flag} {c.name} ({c.code})
                    </div>
                  ))}
                  {filteredCountries.length === 0 && !'global'.includes(countrySearch.toLowerCase()) && (
                    <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No countries match
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Method Name</label>
              <input 
                type="text" 
                placeholder="e.g. UPI ID, PIX, PayPal Email"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Display Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. 🇮🇳 UPI ID (GPay / BHIM)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  style={{ padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem', width: '100%' }}
                />
              </div>
              
              <div style={{ width: '90px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Type</label>
                <select
                  value={newPlaceholderType}
                  onChange={(e) => setNewPlaceholderType(e.target.value)}
                  style={{ padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem', width: '100%', height: '36px' }}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>User Input Placeholder</label>
              <input 
                type="text" 
                placeholder="e.g. e.g. name@okhdfcbank"
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                style={{ padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Custom Fields Manager */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Custom Fields (Optional)</span>
                <button 
                  type="button" 
                  onClick={addCustomField}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--accent-indigo)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  + Add Field
                </button>
              </div>
              
              {customFields.map((field, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <button 
                    type="button"
                    onClick={() => removeCustomField(idx)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    × Remove
                  </button>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Display Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Account Number"
                        value={field.label}
                        onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                        style={{ padding: '6px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.78rem', width: '100%' }}
                      />
                    </div>
                    
                    <div style={{ width: '90px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                        style={{ padding: '6px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.78rem', width: '100%', height: '31px' }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>User Input Placeholder</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1234567890"
                      value={field.placeholder}
                      onChange={(e) => updateCustomField(idx, 'placeholder', e.target.value)}
                      style={{ padding: '6px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{
                marginTop: '6px',
                padding: '10px',
                borderRadius: '6px',
                background: 'var(--accent-indigo, #6366f1)',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'ADDING...' : 'ADD METHOD'}
            </button>
          </form>
        </div>

        {/* Right column: Current gateways list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Configured Payout Methods</h3>
          
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading payment methods...</div>
          ) : methods.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>No methods configured yet.</div>
          ) : (
            methods.map((method) => {
              const matchedCountryObj = countries.find(c => c.name === method.targetCountry);
              const flag = method.targetCountry === 'Global' ? '🌐' : (matchedCountryObj?.flag || '🏳️');

              return (
                <div key={method.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Method Name:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{method.name}</strong>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {flag} {method.targetCountry}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Display Label:</span> {method.label} <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({method.placeholderType || 'text'})</span>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      User Input Placeholder: <em>{method.placeholder}</em>
                    </span>
                    
                    {method.fields && (() => {
                      try {
                        const parsed = typeof method.fields === 'string' ? JSON.parse(method.fields) : method.fields;
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          return (
                            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              <strong>Custom Fields:</strong>
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', listStyleType: 'disc' }}>
                                {parsed.map((f: any, idx: number) => (
                                  <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                                    {f.label} <span style={{ color: 'var(--text-muted)' }}>({f.type})</span> — <span style={{ opacity: 0.7 }}>Placeholder: {f.placeholder}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        }
                      } catch (e) {}
                      return null;
                    })()}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleToggleActive(method)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '4px',
                        background: method.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: method.isActive ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                        border: '1px solid transparent',
                        borderColor: method.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      {method.isActive ? 'ACTIVE' : 'DISABLED'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.02)',
                        color: '#ff4d4d',
                        border: '1px solid rgba(255,0,0,0.15)',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
