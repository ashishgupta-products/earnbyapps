"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { EarningApp } from '../../../data/apps';

export default function CombinedPartnerCampaigns() {
  const { partnershipLeads, submissions, userProfile, apps } = useApp();
  
  // Tab control: 'active' (Live campaigns assigned) vs 'proposals' (Submitted leads)
  const [activeTab, setActiveTab] = useState<'active' | 'proposals'>('active');

  // Search & Filter state for Active Campaigns
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedCampaign, setSelectedCampaign] = useState<EarningApp | null>(null);

  const partnerEmail = userProfile?.email || '';

  // 1. Proposals List (partnershipLeads submitted by this partner)
  const partnerProposals = useMemo(() => {
    const myLeads = partnershipLeads.filter(lead => lead.partnerEmail?.toLowerCase() === partnerEmail.toLowerCase());
    return myLeads.map(lead => {
      // Find matching campaign completed count
      const campaignId = `lead-app-${lead.id}`;
      const campaignSubmissions = submissions.filter(sub => sub.appId === campaignId || sub.appName === lead.appName);
      const completedCount = campaignSubmissions.filter(sub => sub.status === 'Paid').length;
      
      return {
        id: lead.id,
        name: lead.appName,
        target: lead.targetCompletions,
        completed: lead.status === 'Converted' ? completedCount : 0,
        cost: lead.costPerCompletion,
        status: lead.status === 'Converted' ? 'Active' : lead.status,
        currencySymbol: lead.currencySymbol || '₹'
      };
    });
  }, [partnershipLeads, submissions, partnerEmail]);

  // 2. Active Campaigns List (apps where assignedEmail === partnerEmail)
  const activeCampaigns = useMemo(() => {
    return apps
      .filter(app => app.assignedEmail && app.assignedEmail.toLowerCase() === partnerEmail.toLowerCase())
      .map(app => {
        const target = app.targetCompletions || 1000;
        const rateVal = parseFloat(app.earningRate.replace(/[^0-9.]/g, '')) || 0.5;
        const budget = target * rateVal;
        
        const campSubmissions = submissions.filter(sub => sub.appId === app.id);
        const completedCompletions = campSubmissions.filter(sub => sub.status === 'Paid').length;
        const spent = campSubmissions.filter(sub => sub.status === 'Paid').reduce((acc, sub) => acc + sub.reward, 0);

        return {
          ...app,
          targetCompletions: target,
          completedCompletions,
          budget: budget,
          spent: spent
        };
      });
  }, [apps, partnerEmail, submissions]);

  // Filtering for Active Campaigns
  const filteredActiveCampaigns = useMemo(() => {
    return activeCampaigns.filter(camp => {
      const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            camp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || camp.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activeCampaigns, searchTerm, categoryFilter]);

  // Metrics for Active Campaigns
  const totalBudget = useMemo(() => activeCampaigns.reduce((acc, c) => acc + c.budget, 0), [activeCampaigns]);
  const totalSpent = useMemo(() => activeCampaigns.reduce((acc, c) => acc + c.spent, 0), [activeCampaigns]);
  const totalConversions = useMemo(() => activeCampaigns.reduce((acc, c) => acc + c.completedCompletions, 0), [activeCampaigns]);
  const commonSymbol = activeCampaigns.length > 0 ? (activeCampaigns[0].currencySymbol || '₹') : '₹';

  return (
    <div className="partner-content-card">
      <div className="card-header-section" style={{ marginBottom: '24px' }}>
        <h2 className="card-heading">Campaign Manager</h2>
        <p className="card-subheading">Track your campaign proposals, monitor live campaign traction, and manage budgets.</p>
      </div>

      {/* Tabs selector */}
      <div className="campaigns-tab-bar" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'active' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: activeTab === 'active' ? '2px solid var(--accent-indigo)' : 'none',
            marginBottom: '-14px',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          🟢 Active Campaigns ({activeCampaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'proposals' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: activeTab === 'proposals' ? '2px solid var(--accent-indigo)' : 'none',
            marginBottom: '-14px',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          📋 Proposals & Leads ({partnerProposals.length})
        </button>
      </div>

      {activeTab === 'active' ? (
        <>
          {/* Active Campaigns Metrics */}
          <div className="analytics-mock-grid">
            <div className="analytics-mini-card">
              <span className="mini-lbl">Conversions Delivered</span>
              <strong className="mini-val">{totalConversions.toLocaleString()}</strong>
              <span className="mini-change green-txt">▲ Active user traction</span>
            </div>
            <div className="analytics-mock-grid">
              {/* Note: this nested container matches css styles */}
            </div>
            <div className="analytics-mini-card">
              <span className="mini-lbl">Total Burned Budget</span>
              <strong className="mini-val">{commonSymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <span className="mini-change green-txt">{totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(0) : 0}% consumed</span>
            </div>
            <div className="analytics-mini-card">
              <span className="mini-lbl">Remaining Budget</span>
              <strong className="mini-val">{commonSymbol}{(totalBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <span className="mini-change">Allocated campaign funds</span>
            </div>
            <div className="analytics-mini-card">
              <span className="mini-lbl">Active Campaigns</span>
              <strong className="mini-val">{activeCampaigns.length}</strong>
              <span className="mini-change">Running live on Offerwall</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="controls-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', marginTop: '20px' }}>
            <input
              type="text"
              placeholder="Search active campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.01)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="All">All Categories</option>
              <option value="App Install & Sign Up">App Install & Sign Up</option>
              <option value="LinkedIn Followers">LinkedIn Followers</option>
              <option value="Google Maps Reviews">Google Maps Reviews</option>
              <option value="Telegram Members">Telegram Members</option>
              <option value="WhatsApp Members">WhatsApp Members</option>
              <option value="Instagram Followers">Instagram Followers</option>
              <option value="Facebook Page Followers">Facebook Page Followers</option>
              <option value="Youtube Subscribers">Youtube Subscribers</option>
              <option value="Trustpilot Reviews">Trustpilot Reviews</option>
              <option value="Justdial Reviews">Justdial Reviews</option>
              <option value="Play Store Reviews">Play Store Reviews</option>
              <option value="Custom Task">Custom Task</option>
              <option value="Gaming">Gaming</option>
              <option value="Surveys">Surveys</option>
              <option value="App Testing">App Testing</option>
              <option value="Passive">Passive</option>
            </select>
          </div>

          {/* Active Campaigns Table */}
          <div className="table-responsive-container">
            <table className="partner-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Category</th>
                  <th>Payout / Action</th>
                  <th>Conversion Progress</th>
                  <th>Budget Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActiveCampaigns.length > 0 ? (
                  filteredActiveCampaigns.map((camp) => {
                    const progress = camp.targetCompletions > 0 ? (camp.completedCompletions / camp.targetCompletions) * 100 : 0;
                    return (
                      <tr key={camp.id}>
                        <td>
                          <strong style={{ display: 'block' }}>{camp.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platforms: {camp.platforms.join(', ')}</span>
                        </td>
                        <td>
                          <span className="category-tag">{camp.category}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                          {camp.earningRate}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {camp.completedCompletions.toLocaleString()} / {camp.targetCompletions.toLocaleString()} ({progress.toFixed(0)}%)
                            </span>
                            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-indigo)' }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ display: 'block', fontSize: '0.85rem' }}>{camp.currencySymbol || '₹'}{camp.spent.toFixed(2)} spent</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>of {camp.currencySymbol || '₹'}{camp.budget.toFixed(2)}</span>
                        </td>
                        <td>
                          <button 
                            onClick={() => setSelectedCampaign(camp as any)}
                            className="details-btn"
                            style={{
                              background: 'rgba(79, 70, 229, 0.1)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--accent-indigo)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Inspect Tasks
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', fontStyle: 'italic', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No active campaigns running on offerwall.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Proposals & Leads Table */
        <div className="table-responsive-container">
          <table className="partner-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Payout / Action</th>
                <th>Volume Delivered</th>
                <th>Total Budget</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {partnerProposals.length > 0 ? (
                partnerProposals.map((camp) => {
                  const spent = camp.completed * camp.cost;
                  const total = camp.target * camp.cost;
                  return (
                    <tr key={camp.id}>
                      <td>
                        <strong style={{ display: 'block' }}>{camp.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {camp.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{camp.currencySymbol}{camp.cost.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{camp.completed.toLocaleString()} / {camp.target.toLocaleString()}</span>
                          <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', width: '150px' }}>
                            <div style={{ width: `${(camp.completed / camp.target) * 100}%`, height: '100%', background: 'var(--accent-indigo)' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--accent-emerald)' }}>{camp.currencySymbol}{spent.toFixed(2)}</strong>
                        <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-secondary)' }}>of {camp.currencySymbol}{total.toFixed(2)}</span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          background: 
                            camp.status === 'Active' ? 'rgba(16,185,129,0.1)' : 
                            camp.status === 'Completed' ? 'rgba(79,70,229,0.1)' :
                            camp.status === 'Contacted' ? 'rgba(59,130,246,0.1)' :
                            camp.status === 'Declined' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: 
                            camp.status === 'Active' ? 'var(--accent-emerald)' : 
                            camp.status === 'Completed' ? 'var(--accent-indigo)' :
                            camp.status === 'Contacted' ? '#3b82f6' :
                            camp.status === 'Declined' ? '#ef4444' : '#f59e0b'
                        }}>
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', fontStyle: 'italic', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No proposals submitted yet. Click "Create Campaign" to submit one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details inspector modal */}
      {selectedCampaign && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-card modal-card" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>{selectedCampaign.name} Actions</h3>
              <button 
                onClick={() => setSelectedCampaign(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Below is the details of this campaign task active on the main earner offerwall.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>
                  <span>Earning Action Payout</span>
                  <span style={{ color: 'var(--accent-emerald)' }}>+{selectedCampaign.currencySymbol || '₹'}{(selectedCampaign.reward || 0).toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {selectedCampaign.longDescription || selectedCampaign.description}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Platform: <strong>{selectedCampaign.platforms.join(', ')}</strong> | Category: <strong>{selectedCampaign.category}</strong>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedCampaign(null)}
              className="glow-btn-cyan"
              style={{ padding: '10px', marginTop: '8px' }}
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      <style>{`
        .partner-content-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 32px;
          box-shadow: var(--shadow-md);
        }
        .card-header-section {
          margin-bottom: 24px;
        }
        .card-heading {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .card-subheading {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .table-responsive-container {
          width: 100%;
          overflow-x: auto;
          margin-top: 16px;
        }
        .partner-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }
        .partner-table th {
          border-bottom: 1px solid var(--border-color);
          padding: 12px 16px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
        }
        .partner-table td {
          border-bottom: 1px solid var(--border-color);
          padding: 16px;
          vertical-align: middle;
        }
        .category-tag {
          background: rgba(79, 70, 229, 0.06);
          color: var(--accent-indigo);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .details-btn:hover {
          background: rgba(79, 70, 229, 0.2) !important;
        }

        /* Analytics mock grid styles from assigned campaigns */
        .analytics-mock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        .analytics-mini-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mini-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        .mini-val {
          font-size: 1.25rem;
          font-family: var(--font-display);
          color: var(--text-primary);
        }
        .mini-change {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .green-txt {
          color: var(--accent-emerald) !important;
        }
      `}</style>
    </div>
  );
}
