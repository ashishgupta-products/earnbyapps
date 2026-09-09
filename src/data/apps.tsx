import React from 'react';

export interface ReferralSlot {
  id: string;
  userEmail: string;
  referralUrl: string;
  limit: number;
  completedCount: number;
}

export interface EarningApp {
  id: string;
  name: string;
  category: 'Gaming' | 'Surveys' | 'App Testing' | 'Passive' | 'App Install & Sign Up' | 'LinkedIn Followers' | 'Google Maps Reviews' | 'Telegram Members' | 'WhatsApp Members' | 'Instagram Followers' | 'Facebook Page Followers' | 'Youtube Subscribers' | 'Trustpilot Reviews' | 'Justdial Reviews' | 'Play Store Reviews' | 'App Store Reviews' | 'Custom Task';
  platforms: ('iOS' | 'Android' | 'Web')[];
  earningRate: string; // e.g., "$12.50/hr"
  averageEarningsPerDay: number; // for calculator, e.g. 15
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  reviewsCount: number;
  description: string;
  longDescription: string;
  tags: string[];
  logoUrl?: string;
  actionText: string;
  externalUrl?: string;
  targetCountry?: string;
  currency?: string;
  currencySymbol?: string;
  targetCompletions?: number;
  videoUrl?: string;
  referralPool?: ReferralSlot[];
  reward: number; // Single reward amount
  assignedEmail?: string;
  isActive?: boolean;
  referralCode?: string;
}

export const EARNING_APPS: EarningApp[] = [
  {
    id: 'groww',
    name: 'Groww: Stocks & Mutual Funds',
    category: 'App Install & Sign Up',
    platforms: ['Android', 'iOS', 'Web'],
    earningRate: '₹150.00 / signup',
    averageEarningsPerDay: 150.0,
    difficulty: 'Easy',
    rating: 4.8,
    reviewsCount: 48200,
    description: 'Open a free Demat account & complete KYC on Groww to earn instant cash.',
    longDescription: 'Groww is India\'s premier stock and mutual fund platform. Complete your online paperless KYC registration to activate your account and receive instant rewards.',
    tags: ['High Reward', 'Instant KYC', 'Verified Partner'],
    actionText: 'Install & Complete KYC',
    reward: 150.00,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'phonepe',
    name: 'PhonePe UPI Payments',
    category: 'App Install & Sign Up',
    platforms: ['Android', 'iOS'],
    earningRate: '₹50.00 / setup',
    averageEarningsPerDay: 50.0,
    difficulty: 'Easy',
    rating: 4.7,
    reviewsCount: 125000,
    description: 'Install PhonePe and link bank account for first UPI transaction.',
    longDescription: 'Install the PhonePe mobile app, link any Indian bank account via UPI, and complete a test transaction of ₹1 or more to claim your verified reward.',
    tags: ['Instant UPI', 'Popular', 'Low Payout Minimum'],
    actionText: 'Setup UPI & Earn',
    reward: 50.00,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'angelone',
    name: 'Angel One Demat & Trading',
    category: 'App Install & Sign Up',
    platforms: ['Android', 'iOS', 'Web'],
    earningRate: '₹200.00 / account',
    averageEarningsPerDay: 200.0,
    difficulty: 'Medium',
    rating: 4.6,
    reviewsCount: 32000,
    description: 'Open a zero-brokerage Demat account on Angel One.',
    longDescription: 'Complete your full Aadhaar and PAN verification on Angel One to unlock smart trading tools and receive ₹200 credited directly to your EarnByApps wallet.',
    tags: ['Top Earner', 'Finance', 'Fast Verification'],
    actionText: 'Open Account',
    reward: 200.00,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'winzo',
    name: 'WinZO Games',
    category: 'Gaming',
    platforms: ['Android'],
    earningRate: '₹35.00 / play',
    averageEarningsPerDay: 35.0,
    difficulty: 'Easy',
    rating: 4.5,
    reviewsCount: 89400,
    description: 'Install WinZO app and play 3 casual mobile games.',
    longDescription: 'Download the WinZO APK, play 3 quick casual matches (Carrom, Ludo, or Fruit Samurai), and upload your gameplay profile screenshot for instant approval.',
    tags: ['Android Only', 'Fun & Games', 'Instant Payout'],
    actionText: 'Play & Earn',
    reward: 35.00,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'swagbucks-in',
    name: 'Swagbucks India Surveys',
    category: 'Surveys',
    platforms: ['Android', 'iOS', 'Web'],
    earningRate: '₹100.00 / survey',
    averageEarningsPerDay: 100.0,
    difficulty: 'Easy',
    rating: 4.6,
    reviewsCount: 24500,
    description: 'Complete Indian consumer demographic surveys for instant cash.',
    longDescription: 'Participate in consumer opinion surveys tailored for Indian households. Share your thoughts on popular Indian brands and earn direct cash.',
    tags: ['Surveys', 'Instant Payout', 'Work From Home'],
    actionText: 'Start Survey',
    reward: 100.00,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  },
  {
    id: 'rozdhan',
    name: 'Roz Dhan: News & Earn',
    category: 'Passive',
    platforms: ['Android'],
    earningRate: '₹25.00 / install',
    averageEarningsPerDay: 25.0,
    difficulty: 'Easy',
    rating: 4.3,
    reviewsCount: 18400,
    description: 'Read news articles and check in daily on Roz Dhan.',
    longDescription: 'Install Roz Dhan, register with your mobile number, and complete 3 daily check-ins to receive the verified installation bonus.',
    tags: ['Passive', 'Daily Bonus', 'Easy Task'],
    actionText: 'Install App',
    reward: 25.00,
    targetCountry: 'India',
    currency: 'INR',
    currencySymbol: '₹'
  }
];

export const getCategoryIcon = (category: string): React.ReactNode => {
  const style = { display: 'inline-block', verticalAlign: 'middle', width: '1.2em', height: '1.2em' };
  switch (category) {
    case 'Gaming':
    case 'Gaming (Game Installs & Levels)':
      return <svg viewBox="0 0 24 24" fill="#9C27B0" style={style}><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>;
    case 'Surveys':
    case 'Surveys (Demographics Opinion)':
      return <svg viewBox="0 0 24 24" fill="#FF9800" style={style}><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>;
    case 'App Testing':
    case 'App Testing (User Feedback)':
      return <svg viewBox="0 0 24 24" fill="#00BCD4" style={style}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
    case 'App Store Reviews':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <rect x="0" y="0" width="24" height="24" rx="5.2" fill="#007AFF" />
          <path d="M8.8086 14.9194l6.1107-11.0368c.0837-.1513.1682-.302.2437-.4584.0685-.142.1267-.2854.1646-.4403.0803-.3259.0588-.6656-.066-.9767-.1238-.3095-.3417-.5678-.6201-.7355a1.4175 1.4175 0 0 0-.921-.1924c-.3207.043-.6135.1935-.8443.4288-.1094.1118-.1996.2361-.2832.369-.092.1463-.175.2979-.259.4492l-.3864.6979-.3865-.6979c-.0837-.1515-.1667-.303-.2587-.4492-.0837-.1329-.1739-.2572-.2835-.369-.2305-.2353-.5233-.3857-.844-.429a1.4181 1.4181 0 0 0-.921.1926c-.2784.1677-.4964.426-.6203.7355-.1246.311-.1461.6508-.066.9767.038.155.0962.2984.1648.4403.0753.1564.1598.307.2437.4584l1.248 2.2543-4.8625 8.7825H2.0295c-.1676 0-.3351-.0007-.5026.0092-.1522.009-.3004.0284-.448.0714-.3108.0906-.5822.2798-.7783.548-.195.2665-.3006.5929-.3006.9279 0 .3352.1057.6612.3006.9277.196.2683.4675.4575.7782.548.1477.043.296.0623.4481.0715.1675.01.335.009.5026.009h13.0974c.0171-.0357.059-.1294.1-.2697.415-1.4151-.6156-2.843-2.0347-2.843zM3.113 18.5418l-.7922 1.5008c-.0818.1553-.1644.31-.2384.4705-.067.1458-.124.293-.1611.452-.0785.3346-.0576.6834.0645 1.0029.1212.3175.3346.583.607.7549.2727.172.5891.2416.9013.1975.3139-.044.6005-.1986.8263-.4402.1072-.1148.1954-.2424.2772-.3787.0902-.1503.1714-.3059.2535-.4612L6 19.4636c-.0896-.149-.9473-1.4704-2.887-.9218m20.5861-3.0056a1.4707 1.4707 0 0 0-.779-.5407c-.1476-.0425-.2961-.0616-.4483-.0705-.1678-.0099-.3352-.0091-.503-.0091H18.648l-4.3891-7.817c-.6655.7005-.9632 1.485-1.0773 2.1976-.1655 1.0333.0367 2.0934.546 3.0004l5.2741 9.3933c.084.1494.167.299.2591.4435.0837.131.1739.2537.2836.364.231.2323.5238.3809.8449.4232.3192.0424.643-.0244.9217-.1899.2784-.1653.4968-.4204.621-.7257.1246-.3072.146-.6425.0658-.9641-.0381-.1529-.0962-.2945-.165-.4346-.0753-.1543-.1598-.303-.2438-.4524l-1.216-2.1662h1.596c.1677 0 .3351.0009.5029-.009.1522-.009.3007-.028.4483-.0705a1.4707 1.4707 0 0 0 .779-.5407A1.5386 1.5386 0 0 0 24 16.452a1.539 1.539 0 0 0-.3009-.9158z" fill="#FFF" />
        </svg>
      );
    case 'App Install & Sign Up':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <rect x="5" y="2" width="14" height="20" rx="3" fill="none" stroke="#4CAF50" strokeWidth="2" />
          <path d="M12 6v8m-3-3l3 3 3-3" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'LinkedIn Followers':
      return (
        <svg viewBox="0 0 24 24" fill="#0A66C2" style={style}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    case 'Google Maps Reviews':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
          <path d="M12 9c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" fill="#4285F4" />
          <path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="#FBBC05" />
        </svg>
      );
    case 'Telegram Members':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <circle cx="12" cy="12" r="12" fill="#229ED9" />
          <g transform="translate(4.8, 4.8) scale(0.6)">
            <path d="M9.78 15.12l-.28 3.96c.4 0 .58-.18.8-.4l1.88-1.8 3.9 2.88c.72.4 1.24.2 1.42-.66l2.56-12.06c.26-1.04-.4-1.5-1.08-1.2L4.02 10.92c-1 .4-1 .96-.18 1.2l3.86 1.2 8.96-5.64c.42-.26.8-.12.48.16L9.78 15.12z" fill="#FFF" />
          </g>
        </svg>
      );
    case 'WhatsApp Members':
      return (
        <svg viewBox="0 0 24 24" fill="#25D366" style={style}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
      );
    case 'Instagram Followers':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="#E1306C" />
        </svg>
      );
    case 'Facebook Page Followers':
      return (
        <svg viewBox="0 0 24 24" fill="#1877F2" style={style}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'Youtube Subscribers':
      return (
        <svg viewBox="0 0 24 24" fill="#FF0000" style={style}>
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.52 3.5 12 3.5 12 3.5s-7.519 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.482 20.5 12 20.5 12 20.5s7.52 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'Trustpilot Reviews':
      return (
        <svg viewBox="0 0 24 24" fill="#00B67A" style={style}>
          <path d="M22.25 9.176h-7.165l-2.217-6.812a1.055 1.055 0 0 0-2.008 0l-2.217 6.812H1.478a1.056 1.056 0 0 0-.62 1.908l5.807 4.212-2.217 6.811a1.055 1.055 0 0 0 1.624 1.18l5.806-4.213 5.806 4.213a1.056 1.056 0 0 0 1.624-1.18l-2.217-6.811 5.807-4.212a1.056 1.056 0 0 0-.62-1.908z"/>
        </svg>
      );
    case 'Justdial Reviews':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <rect x="0" y="0" width="24" height="24" rx="5.2" fill="#1565C0" />
          <g transform="translate(3, 3)">
            <text x="9" y="11" fill="#FFF" fontSize="10px" fontWeight="900" textAnchor="middle" fontFamily="system-ui, sans-serif" letterSpacing="-0.5px">jd</text>
            <circle cx="9" cy="8.5" r="7.5" fill="none" stroke="#FF6A00" strokeWidth="1.5" />
            <path d="M14.5 14L17 16.5" stroke="#FF6A00" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        </svg>
      );
    case 'Play Store Reviews':
      return (
        <svg viewBox="0 0 24 24" style={style}>
          <rect x="0" y="0" width="24" height="24" rx="5.2" fill="#F1F3F4" />
          <g transform="translate(3.5, 3) scale(0.72)">
            <path d="M1.94 1.15a2.2 2.2 0 00-.58 1.58v18.54c0 .66.21 1.2.58 1.58L2.04 23 12.46 12.58 12.58 12.46 2.04 1.9z" fill="#00C0FF" />
            <path d="M16.141 8.514L13.5 11.155 3.09 1.1c.697-.393 1.594-.32 2.29.08l10.761 6.204a2.26 2.26 0 010 1.13z" fill="#FF3A44" />
            <path d="M22.06 10.425L18.851 8.57 15.02 12.4l3.83 3.83 3.21-1.853c.697-.402 1.096-1.127 1.096-1.977a2.27 2.27 0 00-1.096-1.975z" fill="#FFC107" />
            <path d="M16.141 16.286a2.26 2.26 0 010-1.13l-2.641-2.64-10.41 10.055a2.6 2.6 0 002.29-.08l10.761-6.205z" fill="#00E676" />
          </g>
        </svg>
      );
    case 'Custom Task':
      return <svg viewBox="0 0 24 24" fill="#607D8B" style={style}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="#607D8B" style={style}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>;
  }
};
