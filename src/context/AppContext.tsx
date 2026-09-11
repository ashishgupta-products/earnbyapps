"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { EarningApp, EARNING_APPS, ReferralSlot } from '../data/apps';

export type UserRole = 'user' | 'admin';
export type AppTheme = 'light' | 'dark';

export interface AppTask {
  id: string;
  title: string;
  description: string;
  reward: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  country?: string;
  paymentMethod?: string;
  paymentDetails?: string;
}

export interface PartnershipLead {
  id: string;
  partnerName: string;
  partnerEmail: string;
  appName: string;
  category: 'Gaming' | 'Surveys' | 'App Testing' | 'Passive' | 'App Install & Sign Up' | 'LinkedIn Followers' | 'Google Maps Reviews' | 'Telegram Members' | 'WhatsApp Members' | 'Instagram Followers' | 'Facebook Page Followers' | 'Youtube Subscribers' | 'Trustpilot Reviews' | 'Justdial Reviews' | 'Play Store Reviews' | 'App Store Reviews' | 'Custom Task';
  platforms: ('iOS' | 'Android' | 'Web')[];
  earningRate: string;
  averageEarningsPerDay: number;
  description: string;
  longDescription: string;
  tags: string[];
  actionText: string;
  externalUrl?: string;
  suggestedTasks: AppTask[];
  status: 'New' | 'Contacted' | 'Converted' | 'Declined';
  createdAt: string;
  targetCompletions: number;
  costPerCompletion: number;
  totalBudget: number;
  targetCountry?: string;
  currency?: string;
  currencySymbol?: string;
  referralCode?: string;
}

export interface VerificationAssignment {
  id: string;
  campaignId: string;
  userEmail: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
}

export interface Submission {
  id: string;
  userName: string;
  userEmail: string;
  appName: string;
  appId: string;
  taskId?: string;
  taskTitle?: string;
  reward: number;
  proof: string;
  proofType?: 'image' | 'video' | 'text';
  proofUrl?: string;
  status: 'Pending' | 'Paid' | 'Rejected';
  time: string;
  verifierEmail: string; // 'admin' or user's email
  verificationType: 'admin' | 'creator';
  referralSlotId?: string;
}

interface AppContextType {
  userRole: UserRole;
  userProfile: UserProfile | null;
  apps: EarningApp[];
  pendingApps: EarningApp[];
  partnershipLeads: PartnershipLead[];
  submissions: Submission[];
  verificationAssignments: VerificationAssignment[];
  walletBalance: number;
  completedTaskIds: string[];
  theme: AppTheme;
  login: (role: UserRole) => void;
  logout: () => void;
  submitOffer: (app: Omit<EarningApp, 'id' | 'rating' | 'reviewsCount' | 'difficulty'>) => void;
  updateOffer: (app: EarningApp) => void;
  deleteOffer: (id: string) => void;
  approveOffer: (id: string, updatedApp?: EarningApp) => void;
  rejectOffer: (id: string) => void;
  submitPartnershipLead: (lead: Omit<PartnershipLead, 'id' | 'status' | 'createdAt' | 'partnerName' | 'partnerEmail'>) => void;
  updateLeadStatus: (id: string, status: PartnershipLead['status']) => void;
  claimTask: (taskId: string, reward: number) => void;
  toggleTheme: () => void;
  updateUserProfile: (profile: UserProfile | null) => void;
  addVerificationAssignment: (assignment: Omit<VerificationAssignment, 'id'>) => void;
  removeVerificationAssignment: (id: string) => void;
  addReferralSlotToCampaign: (appId: string, slot: Omit<ReferralSlot, 'id' | 'completedCount'>) => void;
  removeReferralSlot: (appId: string, slotId: string) => void;
  submitTaskCompletion: (appId: string, proof: string, proofType?: 'image' | 'video' | 'text', proofUrl?: string) => void;
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_LEADS: PartnershipLead[] = [
  {
    id: 'lead-1',
    partnerName: 'Vikram Malhotra',
    partnerEmail: 'vikram@growwpartner.in',
    appName: 'Groww Demat Onboarding Campaign',
    category: 'App Install & Sign Up',
    platforms: ['Android', 'iOS'],
    earningRate: '₹150.00 / action',
    averageEarningsPerDay: 150.0,
    description: 'Install and complete KYC on Groww.',
    longDescription: 'A custom partner campaign to acquire verified KYC Demat accounts in India.',
    tags: ['Finance', 'KYC', 'High Value'],
    actionText: 'Open Groww Partner Campaign',
    suggestedTasks: [
      { id: 'lead-task-1', title: 'Complete Aadhaar KYC', description: 'Finish in-app Demat KYC verification.', reward: 150.00 }
    ],
    status: 'New',
    createdAt: '15 Jun 2026',
    targetCompletions: 2000,
    costPerCompletion: 150.00,
    totalBudget: 300000,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  }
];

const INITIAL_SUBMISSIONS: Submission[] = [
  { 
    id: 'sub-1', 
    userName: 'Rahul Sharma', 
    userEmail: 'rahul@example.com', 
    appName: 'Groww: Stocks & Mutual Funds', 
    appId: 'groww', 
    taskId: 'gw-1', 
    taskTitle: 'Complete KYC Registration', 
    reward: 150.00, 
    proof: 'KYC verified successfully in Groww app. Profile completed with Aadhaar and PAN verification screenshot attached.', 
    proofType: 'image',
    proofUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    time: '10 mins ago', 
    status: 'Pending', 
    verifierEmail: 'admin', 
    verificationType: 'admin' 
  },
  { 
    id: 'sub-2', 
    userName: 'Raj Patel', 
    userEmail: 'raj@gmail.com', 
    appName: 'PhonePe UPI Payments', 
    appId: 'phonepe', 
    taskId: 'pp-1', 
    taskTitle: 'Setup First UPI Payment', 
    reward: 50.00, 
    proof: 'First transaction of ₹10 completed. Transaction ID: T240911144028491823901. Payment success receipt screenshot uploaded.', 
    proofType: 'image',
    proofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    time: '1 hour ago', 
    status: 'Pending', 
    verifierEmail: 'admin', 
    verificationType: 'admin' 
  },
  { 
    id: 'sub-3', 
    userName: 'Sonia Sharma', 
    userEmail: 'sonia@gmail.com', 
    appName: 'Swagbucks India Surveys', 
    appId: 'swagbucks-in', 
    taskId: 'sb-1', 
    taskTitle: 'Complete Consumer Profile', 
    reward: 100.00, 
    proof: 'Verified 100% profile survey completion dashboard. Earned 100 SB points initial milestone.', 
    proofType: 'image',
    proofUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    time: '4 hours ago', 
    status: 'Paid', 
    verifierEmail: 'admin', 
    verificationType: 'admin' 
  },
  { 
    id: 'sub-4', 
    userName: 'Amit Verma', 
    userEmail: 'amit@gmail.com', 
    appName: 'WinZO Games', 
    appId: 'winzo', 
    taskId: 'wz-1', 
    taskTitle: 'Play 3 Casual Matches', 
    reward: 35.00, 
    proof: 'Played 3 matches in Fruit Samurai. WinZO profile ID: wz_98248924823. Text confirmation only.', 
    proofType: 'text',
    time: '1 day ago', 
    status: 'Paid', 
    verifierEmail: 'admin', 
    verificationType: 'admin' 
  }
];

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [apps, setApps] = useState<EarningApp[]>([]);
  const [pendingApps, setPendingApps] = useState<EarningApp[]>([]);
  const [partnershipLeads, setPartnershipLeads] = useState<PartnershipLead[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [verificationAssignments, setVerificationAssignments] = useState<VerificationAssignment[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(250.00);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<AppTheme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync Google session with AppContext user profile and role
  useEffect(() => {
    if (session && session.user) {
      setUserProfile({
        fullName: session.user.name || 'Google User',
        email: session.user.email || 'user@example.com',
        phone: '',
        gender: '',
        country: 'India',
        paymentMethod: 'UPI ID',
        paymentDetails: 'user@bank'
      });
      setUserRole((session.user as any).role || 'user');
    } else {
      // Clear profile when Google session is signed out
      setUserProfile(null);
      setUserRole('user');
    }
  }, [session]);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('eb_role') as UserRole;
      const storedProfile = localStorage.getItem('eb_profile');
      const storedApps = localStorage.getItem('eb_apps');
      const storedPending = localStorage.getItem('eb_pending');
      const storedLeads = localStorage.getItem('eb_leads');
      const storedSubmissions = localStorage.getItem('eb_submissions');
      const storedAssignments = localStorage.getItem('eb_assignments');
      const storedWallet = localStorage.getItem('eb_wallet');
      const storedCompleted = localStorage.getItem('eb_completed');
      const storedTheme = localStorage.getItem('eb_theme') as AppTheme;

      if (storedRole) {
        setUserRole(storedRole);
      } else {
        setUserRole('user');
      }
      
      // Auto-assign a default user profile details if they are in User role but don't have one
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        setUserProfile(null);
      }

      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme('light');
      }
      
      if (storedApps) {
        setApps(JSON.parse(storedApps));
      } else {
        setApps(EARNING_APPS);
        localStorage.setItem('eb_apps', JSON.stringify(EARNING_APPS));
      }

      if (storedPending) setPendingApps(JSON.parse(storedPending));
      
      if (storedLeads) {
        setPartnershipLeads(JSON.parse(storedLeads));
      } else {
        setPartnershipLeads(INITIAL_LEADS);
        localStorage.setItem('eb_leads', JSON.stringify(INITIAL_LEADS));
      }

      if (storedSubmissions) {
        setSubmissions(JSON.parse(storedSubmissions));
      } else {
        setSubmissions(INITIAL_SUBMISSIONS);
        localStorage.setItem('eb_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
      }

      if (storedAssignments) {
        setVerificationAssignments(JSON.parse(storedAssignments));
      } else {
        setVerificationAssignments([]);
      }

      if (storedWallet) setWalletBalance(parseFloat(storedWallet));
      if (storedCompleted) setCompletedTaskIds(JSON.parse(storedCompleted));
    } catch (e) {
      console.error("Failed to load local storage state:", e);
      setApps(EARNING_APPS);
      setPartnershipLeads(INITIAL_LEADS);
      setSubmissions(INITIAL_SUBMISSIONS);
    }
    setIsInitialized(true);
  }, []);

  // Load campaigns from database API
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const dbApps = await res.json();
          if (dbApps && dbApps.length > 0) {
            setApps(dbApps);
            localStorage.setItem('eb_apps', JSON.stringify(dbApps));
          }
        }
      } catch (e) {
        console.error("Failed to load campaigns from DB API, using local storage fallback", e);
      }
    }
    loadCampaigns();
  }, []);

  // Load submissions from database API
  useEffect(() => {
    async function loadSubmissions() {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const dbSubmissions = await res.json();
          if (dbSubmissions && dbSubmissions.length > 0) {
            setSubmissions(dbSubmissions);
            localStorage.setItem('eb_submissions', JSON.stringify(dbSubmissions));
          }
        }
      } catch (e) {
        console.error("Failed to load submissions from DB API, using local storage fallback", e);
      }
    }
    loadSubmissions();
  }, []);

  // Sync theme changes to body class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    if (isInitialized) {
      localStorage.setItem('eb_theme', theme);
    }
  }, [theme, isInitialized]);

  // Sync state changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_role', userRole);
  }, [userRole, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_apps', JSON.stringify(apps));
  }, [apps, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_pending', JSON.stringify(pendingApps));
  }, [pendingApps, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_leads', JSON.stringify(partnershipLeads));
  }, [partnershipLeads, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_submissions', JSON.stringify(submissions));
  }, [submissions, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_assignments', JSON.stringify(verificationAssignments));
  }, [verificationAssignments, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_wallet', walletBalance.toString());
  }, [walletBalance, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('eb_completed', JSON.stringify(completedTaskIds));
  }, [completedTaskIds, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    if (userProfile) {
      localStorage.setItem('eb_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('eb_profile');
    }
  }, [userProfile, isInitialized]);


  const login = (role: UserRole) => {
    setUserRole(role);
  };

  const logout = () => {
    setUserRole('user');
    setUserProfile(null);
  };

  const updateUserProfile = (profile: UserProfile | null) => {
    setUserProfile(profile);
  };

  const submitOffer = async (newApp: Omit<EarningApp, 'id' | 'rating' | 'reviewsCount' | 'difficulty'>) => {
    const fullApp: EarningApp = {
      ...newApp,
      id: `custom-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 1,
      difficulty: 'Easy'
    };
    
    // Update local state
    setApps(prev => {
      const nextApps = [...prev, fullApp];
      localStorage.setItem('eb_apps', JSON.stringify(nextApps));
      return nextApps;
    });

    // Save to Neon Database
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullApp)
      });
      console.log("Successfully saved campaign to Neon PostgreSQL database");
    } catch (e) {
      console.error("Error saving campaign to database API:", e);
    }
  };

  const updateOffer = async (updatedApp: EarningApp) => {
    // Update local state
    setApps(prev => {
      const nextApps = prev.map(app => app.id === updatedApp.id ? updatedApp : app);
      localStorage.setItem('eb_apps', JSON.stringify(nextApps));
      return nextApps;
    });

    // Save to Neon Database
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedApp)
      });
      console.log("Successfully updated campaign in Neon PostgreSQL database");
    } catch (e) {
      console.error("Error updating campaign in database API:", e);
    }
  };

  const deleteOffer = async (id: string) => {
    // Update local state
    setApps(prev => {
      const nextApps = prev.filter(app => app.id !== id);
      localStorage.setItem('eb_apps', JSON.stringify(nextApps));
      return nextApps;
    });

    // Delete from Neon Database
    try {
      await fetch(`/api/campaigns?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      console.log("Successfully deleted campaign from database");
    } catch (e) {
      console.error("Error deleting campaign from database API:", e);
    }
  };

  const approveOffer = async (id: string, updatedApp?: EarningApp) => {
    const appToApprove = updatedApp || pendingApps.find(app => app.id === id);
    if (!appToApprove) return;

    setApps(prev => {
      if (prev.some(app => app.id === appToApprove.id)) return prev;
      const nextApps = [...prev, appToApprove];
      localStorage.setItem('eb_apps', JSON.stringify(nextApps));
      return nextApps;
    });
    setPendingApps(prev => prev.filter(app => app.id !== id));

    // Save to Neon Database
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appToApprove)
      });
      console.log("Successfully saved approved campaign to database");
    } catch (e) {
      console.error("Error saving approved campaign to database API:", e);
    }
  };

  const rejectOffer = (id: string) => {
    setPendingApps(prev => prev.filter(app => app.id !== id));
  };

  const submitPartnershipLead = (lead: Omit<PartnershipLead, 'id' | 'status' | 'createdAt' | 'partnerName' | 'partnerEmail'>) => {
    const fullLead: PartnershipLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      partnerName: userProfile?.fullName || 'Alice Partner', // Simple default name
      partnerEmail: userProfile?.email || 'alice@partner.com', // Simple default email
      status: 'New',
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setPartnershipLeads(prev => [...prev, fullLead]);
  };

  const updateLeadStatus = (id: string, status: PartnershipLead['status']) => {
    setPartnershipLeads(prev => {
      const nextLeads = prev.map(lead => lead.id === id ? { ...lead, status } : lead);
      
      // If converted, automatically create a campaign in apps!
      if (status === 'Converted') {
        const lead = prev.find(l => l.id === id);
        if (lead) {
          // Check if already in apps to avoid duplicates
          setApps(currentApps => {
            if (currentApps.some(app => app.id === `lead-app-${lead.id}`)) return currentApps;
            const newCampaign: EarningApp = {
              id: `lead-app-${lead.id}`,
              name: lead.appName,
              category: lead.category,
              platforms: lead.platforms,
              earningRate: lead.earningRate,
              averageEarningsPerDay: lead.averageEarningsPerDay,
              difficulty: 'Easy',
              rating: 5.0,
              reviewsCount: 1,
              description: lead.description,
              longDescription: lead.longDescription,
              tags: lead.tags,
              actionText: lead.actionText,
              externalUrl: lead.externalUrl,
              targetCountry: lead.targetCountry,
              currency: lead.currency,
              currencySymbol: lead.currencySymbol,
              targetCompletions: lead.targetCompletions,
              reward: lead.averageEarningsPerDay,
              assignedEmail: lead.partnerEmail,
              isActive: true,
              referralCode: lead.referralCode
            };
            
            // Post to backend database
            fetch('/api/campaigns', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newCampaign)
            }).catch(e => console.error("Error creating campaign from lead:", e));

            return [...currentApps, newCampaign];
          });
        }
      }
      return nextLeads;
    });
  };

  const claimTask = (taskId: string, reward: number) => {
    if (completedTaskIds.includes(taskId)) return;
    setCompletedTaskIds(prev => [...prev, taskId]);
    setWalletBalance(prev => parseFloat((prev + reward).toFixed(2)));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addVerificationAssignment = (assignment: Omit<VerificationAssignment, 'id'>) => {
    const newAssignment: VerificationAssignment = {
      ...assignment,
      id: `assignment-${Date.now()}`
    };
    setVerificationAssignments(prev => [...prev, newAssignment]);
  };

  const removeVerificationAssignment = (id: string) => {
    setVerificationAssignments(prev => prev.filter(a => a.id !== id));
  };

  const addReferralSlotToCampaign = (appId: string, slot: Omit<ReferralSlot, 'id' | 'completedCount'>) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        const newSlot: ReferralSlot = {
          ...slot,
          id: `slot-${Date.now()}`,
          completedCount: 0
        };
        return {
          ...app,
          referralPool: [...(app.referralPool || []), newSlot]
        };
      }
      return app;
    }));
  };

  const removeReferralSlot = (appId: string, slotId: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          referralPool: (app.referralPool || []).filter(s => s.id !== slotId)
        };
      }
      return app;
    }));
  };

  const submitTaskCompletion = (appId: string, proof: string, proofType?: 'image' | 'video' | 'text', proofUrl?: string) => {
    const targetApp = apps.find(a => a.id === appId);
    if (!targetApp) return;

    let verifierEmail = 'admin';
    let verificationType: 'admin' | 'creator' = 'admin';
    let referralSlotId: string | undefined;

    // Check verification assignment schedule first
    const now = new Date().toISOString();
    const activeAssignment = verificationAssignments.find(a => 
      a.campaignId === appId && now >= a.startDateTime && now <= a.endDateTime
    );

    if (activeAssignment) {
      verifierEmail = activeAssignment.userEmail;
      verificationType = 'creator';
    } else if (targetApp.assignedEmail) {
      verifierEmail = targetApp.assignedEmail;
      verificationType = 'creator';
    } else if (targetApp.referralPool && targetApp.referralPool.length > 0) {
      // Check referral pool next
      const activeSlot = targetApp.referralPool.find(s => s.completedCount < s.limit);
      if (activeSlot) {
        verifierEmail = activeSlot.userEmail;
        verificationType = 'creator';
        referralSlotId = activeSlot.id;
      }
    }

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      userName: userProfile?.fullName || 'Anonymous',
      userEmail: userProfile?.email || 'user@example.com',
      appName: targetApp.name,
      appId,
      reward: targetApp.reward || 5.0,
      proof,
      proofType: proofType || 'text',
      proofUrl,
      status: 'Pending',
      time: 'Just now',
      verifierEmail,
      verificationType,
      referralSlotId
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Persist to Neon Postgres DB API
    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubmission)
    }).catch(err => console.error("Failed to persist submission in database:", err));
  };

  const approveSubmission = (submissionId: string) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId && sub.status === 'Pending') {
        if (sub.userEmail === userProfile?.email) {
          setWalletBalance(w => parseFloat((w + sub.reward).toFixed(2)));
          setCompletedTaskIds(completed => [...completed, sub.appId]);
        }
        
        if (sub.referralSlotId) {
          setApps(prevApps => prevApps.map(app => {
            if (app.id === sub.appId && app.referralPool) {
              return {
                ...app,
                referralPool: app.referralPool.map(slot => {
                  if (slot.id === sub.referralSlotId) {
                    return { ...slot, completedCount: slot.completedCount + 1 };
                  }
                  return slot;
                })
               };
            }
            return app;
          }));
        }
        // Persist to Neon Postgres DB API
        fetch('/api/submissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: submissionId, status: 'Paid' })
        }).catch(err => console.error("Failed to approve submission in database:", err));

        return { ...sub, status: 'Paid' };
      }
      return sub;
    }));
  };

  const rejectSubmission = (submissionId: string) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId && sub.status === 'Pending') {
        // Persist to Neon Postgres DB API
        fetch('/api/submissions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: submissionId, status: 'Rejected' })
        }).catch(err => console.error("Failed to reject submission in database:", err));

        return { ...sub, status: 'Rejected' };
      }
      return sub;
    }));
  };

  return (
    <AppContext.Provider value={{
      userRole,
      userProfile,
      apps,
      pendingApps,
      partnershipLeads,
      submissions,
      verificationAssignments,
      walletBalance,
      completedTaskIds,
      theme,
      login,
      logout,
      submitOffer,
      updateOffer,
      deleteOffer,
      approveOffer,
      rejectOffer,
      submitPartnershipLead,
      updateLeadStatus,
      claimTask,
      toggleTheme,
      updateUserProfile,
      addVerificationAssignment,
      removeVerificationAssignment,
      addReferralSlotToCampaign,
      removeReferralSlot,
      submitTaskCompletion,
      approveSubmission,
      rejectSubmission
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
}

