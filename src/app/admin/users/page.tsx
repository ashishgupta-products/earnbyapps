"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { countries } from '../../../data/countries';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  upi: string;
  country: string;
  tasksDone: number;
  isBlocked: boolean;
  lastLogin: string;
  role: string;
  balance: number;
  pendingPayout?: number;
  totalCashedOut?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}&country=All%20Countries`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch real users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page or search query changes
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Re-fetch users when the tab gains focus (e.g. returning from details tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchUsers();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentPage, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
  };

  const handleToggleBlock = async (userId: string, isBlocked: boolean) => {
    const action = isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      if (res.ok) {
        alert(`Successfully ${action}ed user.`);
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`Failed to update status: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update block status.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE user "${userName}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('User successfully deleted.');
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete user: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  const getCountryFlag = (countryName: string) => {
    const matched = countries.find(c => c.name.toLowerCase() === (countryName || '').toLowerCase());
    return matched ? matched.flag : '🏳️';
  };

  // Pagination calculation
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="admin-moderation-layout">
      {/* List Panel */}
      <div className="submissions-panel">
        <div className="card-header-section" style={{ marginBottom: '20px' }}>
          <h2 className="card-heading">User Management ({totalCount})</h2>
          <p className="card-subheading">View registered earners, developers, and administrators. Click any user to inspect profile metadata, country flags, task completion metrics, and adjust balance in a new tab.</p>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search by name, email, UPI ID..." 
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              minWidth: '0'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '10px 24px', 
              fontSize: '0.9rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              background: '#06b6d4',
              color: 'black',
              border: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            Search
          </button>
        </form>

        <div className="pending-moderation-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>Loading users...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div 
                key={user.id}
                className="pending-item-card"
                style={{
                  background: user.isBlocked ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid ' + (user.isBlocked ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'),
                  borderRadius: '12px',
                  padding: '16px 20px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                  flexWrap: 'wrap'
                }}
              >
                {/* Clickable Profile Inspector Area */}
                <div 
                  onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                  style={{
                    display: 'flex',
                    flex: '1 1 auto',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    flexWrap: 'wrap',
                    cursor: 'pointer'
                  }}
                >
                  {/* Left part: Avatar and Identity */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: '220px', flex: '1 1 200px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: user.isBlocked ? 'linear-gradient(135deg, #ef4444, #991b1b)' : 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      color: user.isBlocked ? 'white' : 'black',
                      flexShrink: 0
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.95rem', color: user.isBlocked ? 'var(--text-muted)' : 'var(--text-primary)', display: 'block', textDecoration: user.isBlocked ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</strong>
                        {user.isBlocked && <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold', flexShrink: 0 }}>BLOCKED</span>}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{user.email}</span>
                    </div>
                  </div>

                  {/* Middle part: Details (Country, Mobile, Gender) in ONE row */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    flex: '2 1 350px',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Country:</span> <span style={{ color: 'var(--text-primary)' }}>{getCountryFlag(user.country)} {user.country}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Mobile:</span> <span style={{ color: 'var(--text-primary)' }}>{user.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Gender:</span> <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user.gender || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Right part: Balance, Role, Block & Delete buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '0 0 auto', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wallet:</span>
                      <strong style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>₹{user.balance.toFixed(2)}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {user.pendingPayout !== undefined && user.pendingPayout > 0 && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'rgba(245,158,11,0.1)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.25)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontWeight: 600
                        }}>
                          ₹{user.pendingPayout.toFixed(2)} Pending
                        </span>
                      )}
                      {user.totalCashedOut !== undefined && user.totalCashedOut > 0 && (
                        <span style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255,255,255,0.04)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}>
                          ₹{user.totalCashedOut.toFixed(2)} Paid
                        </span>
                      )}
                      <span className="app-cat-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{user.role}</span>
                    </div>
                  </div>
                  
                  {/* Action buttons (Only for non-admin accounts) */}
                  {user.role !== 'Admin' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBlock(user.id, user.isBlocked);
                        }}
                        style={{
                          background: user.isBlocked ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          border: '1px solid ' + (user.isBlocked ? 'var(--accent-emerald)' : '#f59e0b'),
                          color: user.isBlocked ? 'var(--accent-emerald)' : '#f59e0b',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id, user.name);
                        }}
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-pending-banner">
              <span style={{ fontSize: '2rem' }}>🔍</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>No users found matching your search.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '24px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .admin-moderation-layout {
          width: 100%;
        }

        .submissions-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--shadow-md);
        }

        .pending-item-card:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: var(--border-hover) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .app-cat-badge {
          display: inline-block;
          font-size: 0.7rem;
          background: var(--border-color);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .empty-pending-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          border: 1px dashed var(--border-color);
          border-radius: 8px;
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
