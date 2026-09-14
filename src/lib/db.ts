import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import crypto from 'crypto';

// Ensure the connection string is defined
const connectionString = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
  connectionString && 
  connectionString.trim().length > 0 && 
  !connectionString.includes('placeholder')
);

if (!isDbConfigured) {
  console.warn("WARNING: DATABASE_URL is not configured. Using local in-memory fallback mode.");
}

const client = isDbConfigured ? neon(connectionString!) : null;

// In-memory fallback stores for local development when DATABASE_URL is not set
const inMemoryUsers: any[] = [
  {
    id: '2',
    email: 'aashish.gupta.mails@gmail.com',
    full_name: 'Ashish Gupta',
    fullName: 'Ashish Gupta',
    phone: '+91 9876543210',
    gender: 'Male',
    country: 'India',
    role: 'admin',
    balance: '100.00',
    payment_method: 'UPI ID',
    paymentMethod: 'UPI ID',
    payment_details: JSON.stringify({ upiId: 'ashish@upi' }),
    paymentDetails: JSON.stringify({ upiId: 'ashish@upi' }),
    is_blocked: false,
    password: crypto.createHash('sha256').update('password123').digest('hex'),
    device_id: null,
    origin_app_id: 'main',
    originAppId: 'main',
    created_at: new Date().toISOString()
  },
  {
    id: '1',
    email: 'tester@example.com',
    full_name: 'Earner User',
    fullName: 'Earner User',
    phone: '+91 9876543210',
    gender: 'Male',
    country: 'India',
    role: 'user',
    balance: '100.00',
    payment_method: 'UPI ID',
    paymentMethod: 'UPI ID',
    payment_details: JSON.stringify({ upiId: 'earner@upi' }),
    paymentDetails: JSON.stringify({ upiId: 'earner@upi' }),
    is_blocked: false,
    password: crypto.createHash('sha256').update('password123').digest('hex'),
    device_id: null,
    origin_app_id: 'main',
    originAppId: 'main',
    created_at: new Date().toISOString()
  }
];

const inMemorySubmissions: any[] = [];
const inMemoryPayoutRequests: any[] = [];
const inMemoryIndependentApps: any[] = [
  {
    id: 'indep-angelone',
    appName: 'Angel One Demat & Trading',
    app_name: 'Angel One Demat & Trading',
    appImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80',
    app_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80',
    description: 'Complete paperless Aadhaar & PAN KYC verification. Instant demat account activation and direct cash reward credited to your bank.',
    referralCode: 'ANGELDIRECT',
    referral_code: 'ANGELDIRECT',
    appLink: 'https://angelone.in/referral?ref=ANGELDIRECT',
    app_link: 'https://angelone.in/referral?ref=ANGELDIRECT',
    rewardBadge: '₹250 Direct Cash',
    reward_badge: '₹250 Direct Cash',
    category: 'Finance & Demat',
    isActive: true,
    is_active: true,
    createdAt: '2026-09-12',
    created_at: new Date().toISOString()
  },
  {
    id: 'indep-groww',
    appName: 'Groww: Stocks & Mutual Funds',
    app_name: 'Groww: Stocks & Mutual Funds',
    appImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=160&auto=format&fit=crop&q=80',
    app_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=160&auto=format&fit=crop&q=80',
    description: 'Open a zero-maintenance Demat account on Groww. Complete KYC to receive instant cashback sent straight to your primary bank account.',
    referralCode: 'GROWW2026',
    referral_code: 'GROWW2026',
    appLink: 'https://groww.in/open-demat-account?invite=GROWW2026',
    app_link: 'https://groww.in/open-demat-account?invite=GROWW2026',
    rewardBadge: '₹150 Instant Credit',
    reward_badge: '₹150 Instant Credit',
    category: 'Finance & Demat',
    isActive: true,
    is_active: true,
    createdAt: '2026-09-11',
    created_at: new Date().toISOString()
  },
  {
    id: 'indep-winzo',
    appName: 'WinZO Games: Play & Win',
    app_name: 'WinZO Games: Play & Win',
    appImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
    app_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
    description: 'Download verified Android APK and play casual games. Sign up with invite code for instant ₹50 wallet cash redeemable via UPI.',
    referralCode: 'WINZO50',
    referral_code: 'WINZO50',
    appLink: 'https://winzogames.com/install?ref=WINZO50',
    app_link: 'https://winzogames.com/install?ref=WINZO50',
    rewardBadge: '₹50 Signup Bonus',
    reward_badge: '₹50 Signup Bonus',
    category: 'Casual Gaming',
    isActive: true,
    is_active: true,
    createdAt: '2026-09-10',
    created_at: new Date().toISOString()
  },
  {
    id: 'indep-swagbucks',
    appName: 'Swagbucks India Surveys',
    app_name: 'Swagbucks India Surveys',
    appImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
    app_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
    description: 'Participate in everyday consumer opinion surveys. Zero waiting time—rewards are credited and transferred directly via PayPal or gift cards.',
    referralCode: 'SWAG2026',
    referral_code: 'SWAG2026',
    appLink: 'https://www.swagbucks.com/register?r=SWAG2026',
    app_link: 'https://www.swagbucks.com/register?r=SWAG2026',
    rewardBadge: '₹100 Direct Voucher',
    reward_badge: '₹100 Direct Voucher',
    category: 'Surveys & Tasks',
    isActive: true,
    is_active: true,
    createdAt: '2026-09-09',
    created_at: new Date().toISOString()
  },
  {
    id: 'indep-navi',
    appName: 'Navi: UPI, Loans & Digital Gold',
    app_name: 'Navi: UPI, Loans & Digital Gold',
    appImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=160&auto=format&fit=crop&q=80',
    app_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=160&auto=format&fit=crop&q=80',
    description: 'Setup Navi UPI and make a minimum digital gold purchase of ₹10 to unlock a flat ₹100 direct cashback deposited into your UPI linked bank.',
    referralCode: 'NAVI100',
    referral_code: 'NAVI100',
    appLink: 'https://navi.com/referral?code=NAVI100',
    app_link: 'https://navi.com/referral?code=NAVI100',
    rewardBadge: '₹100 Direct Cashback',
    reward_badge: '₹100 Direct Cashback',
    category: 'UPI & Banking',
    isActive: true,
    is_active: true,
    createdAt: '2026-09-08',
    created_at: new Date().toISOString()
  }
];

const fallbackCampaigns: any[] = [
  {
    id: 'groww',
    name: 'Groww: Stocks & Mutual Funds',
    category: 'Finance',
    platforms: 'Android,iOS',
    earning_rate: '₹150.00/task',
    reward: '150.00',
    description: 'Install and complete KYC registration.',
    long_description: 'Register and explore financial products to earn rewards.',
    tags: 'Finance,High Reward,Popular',
    external_url: 'https://groww.in',
    target_country: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    target_completions: 500,
    is_active: true,
    logo_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 'angelone',
    name: 'Angel One Demat Account',
    category: 'Finance',
    platforms: 'Android,iOS,Web',
    earning_rate: '₹200.00/task',
    reward: '200.00',
    description: 'Open a free Demat Account and verify account.',
    long_description: 'Complete registration on Angel One to claim reward.',
    tags: 'Finance,Top Earner',
    external_url: 'https://angelone.in',
    target_country: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    target_completions: 1000,
    is_active: true,
    logo_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 'phonepe',
    name: 'PhonePe UPI Payments',
    category: 'Finance',
    platforms: 'Android,iOS',
    earning_rate: '₹50.00/task',
    reward: '50.00',
    description: 'Install PhonePe and link bank account for first UPI transaction.',
    long_description: 'Connect your Indian bank account and complete a test transaction of ₹1 or more.',
    tags: 'UPI,Fast Payout,Popular',
    external_url: 'https://phonepe.com',
    target_country: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    target_completions: 1500,
    is_active: true,
    logo_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 'winzo',
    name: 'WinZO Games',
    category: 'Gaming',
    platforms: 'Android',
    earning_rate: '₹35.00/task',
    reward: '35.00',
    description: 'Install WinZO app and play 3 casual mobile games.',
    long_description: 'Download the APK launcher, play 3 fun games, and upload gameplay screenshot proof.',
    tags: 'Gaming,Instant Payout',
    external_url: 'https://winzogames.com',
    target_country: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    target_completions: 2500,
    is_active: true,
    logo_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: 'swagbucks-in',
    name: 'Swagbucks India Surveys',
    category: 'Surveys',
    platforms: 'Android,iOS,Web',
    earning_rate: '₹100.00/task',
    reward: '100.00',
    description: 'Earn points by taking fun surveys and answering questions.',
    long_description: 'Complete your initial onboarding survey for Indian consumers.',
    tags: 'Surveys,Easy',
    external_url: 'https://swagbucks.com',
    target_country: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    target_completions: 2000,
    is_active: true,
    logo_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    created_at: new Date().toISOString()
  }
];

function executeFallbackSql(strings: any, ...values: any[]): Promise<any[]> {
  const rawSql = Array.isArray(strings) ? strings.join(' ? ') : String(strings);

  if (rawSql.includes('ALTER TABLE') || rawSql.includes('CREATE TABLE')) {
    return Promise.resolve([]);
  }

  if (rawSql.includes('FROM campaigns')) {
    if (rawSql.includes('COUNT(')) {
      return Promise.resolve([{ count: String(fallbackCampaigns.length) }]);
    }
    return Promise.resolve(fallbackCampaigns);
  }

  if (rawSql.includes('FROM users')) {
    // Check search term if present
    const searchVal = values.find(v => typeof v === 'string' && v.startsWith('%') && v.endsWith('%'));
    let filteredUsers = inMemoryUsers;
    if (searchVal && searchVal !== '%%') {
      const term = searchVal.replace(/%/g, '').toLowerCase();
      filteredUsers = inMemoryUsers.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.phone && u.phone.toLowerCase().includes(term)) ||
        (u.payment_details && u.payment_details.toLowerCase().includes(term)) ||
        String(u.id).includes(term)
      );
    }

    // COUNT query check specifically for users count
    if (rawSql.includes('SELECT COUNT(')) {
      return Promise.resolve([{ count: String(filteredUsers.length) }]);
    }

    if (rawSql.includes('device_id =') && rawSql.includes('id !=')) {
      return Promise.resolve([]);
    }

    const emailVal = values.find(v => typeof v === 'string' && v.includes('@'));
    if (emailVal) {
      const u = inMemoryUsers.find(x => x.email.toLowerCase() === emailVal.toLowerCase());
      return Promise.resolve(u ? [u] : []);
    }

    const idVal = values.find(v => typeof v === 'string' || typeof v === 'number');
    if (rawSql.includes('WHERE id =') || rawSql.includes('WHERE u.id =')) {
      const u = inMemoryUsers.find(x => String(x.id) === String(idVal));
      return Promise.resolve(u ? [u] : []);
    }

    if (rawSql.includes('LIMIT') && rawSql.includes('OFFSET')) {
      const limitVal = typeof values[values.length - 2] === 'number' ? values[values.length - 2] : 5;
      const offsetVal = typeof values[values.length - 1] === 'number' ? values[values.length - 1] : 0;
      return Promise.resolve(filteredUsers.slice(offsetVal, offsetVal + limitVal));
    }

    return Promise.resolve(filteredUsers);
  }

  if (rawSql.includes('INSERT INTO users')) {
    const newUser = {
      id: String(values[0] || (inMemoryUsers.length + 1)),
      email: values[1] ? String(values[1]).toLowerCase() : 'newuser@example.com',
      password: values[2] || '',
      full_name: values[3] || 'New User',
      fullName: values[3] || 'New User',
      role: values[4] || 'user',
      balance: 100.00,
      origin_app_id: values[6] || 'main',
      originAppId: values[6] || 'main',
      device_id: values[7] || null,
      deviceId: values[7] || null,
      payment_method: 'UPI ID',
      paymentMethod: 'UPI ID',
      payment_details: JSON.stringify({ upiId: `${values[1] ? String(values[1]).split('@')[0] : 'user'}@upi` }),
      paymentDetails: JSON.stringify({ upiId: `${values[1] ? String(values[1]).split('@')[0] : 'user'}@upi` }),
      is_blocked: false,
      created_at: new Date().toISOString()
    };
    inMemoryUsers.push(newUser);
    return Promise.resolve([newUser]);
  }

  if (rawSql.includes('UPDATE users')) {
    if (rawSql.includes('is_blocked =')) {
      const isBlocked = values[0];
      const userId = values[1];
      const u = inMemoryUsers.find(x => String(x.id) === String(userId));
      if (u) u.is_blocked = !!isBlocked;
    } else if (rawSql.includes('balance = balance +')) {
      const amt = values[0];
      const userId = values[1];
      const u = inMemoryUsers.find(x => String(x.id) === String(userId));
      if (u) u.balance = (parseFloat(u.balance || '0') + parseFloat(amt)).toFixed(2);
    }
    return Promise.resolve([]);
  }

  if (rawSql.includes('DELETE FROM users')) {
    const idVal = values[0];
    const idx = inMemoryUsers.findIndex(x => String(x.id) === String(idVal));
    if (idx !== -1) inMemoryUsers.splice(idx, 1);
    return Promise.resolve([]);
  }

  if (rawSql.includes('FROM submissions')) {
    if (rawSql.includes('COUNT(')) {
      return Promise.resolve([{ count: String(inMemorySubmissions.length) }]);
    }
    return Promise.resolve(inMemorySubmissions);
  }

  if (rawSql.includes('INSERT INTO submissions')) {
    inMemorySubmissions.push({ id: values[0], created_at: new Date().toISOString() });
    return Promise.resolve([]);
  }

  if (rawSql.includes('FROM payout_requests')) {
    const emailVal = values.find(v => typeof v === 'string' && v.includes('@'));
    if (emailVal) {
      return Promise.resolve(inMemoryPayoutRequests.filter(p => p.user_email.toLowerCase() === emailVal.toLowerCase()));
    }
    return Promise.resolve(inMemoryPayoutRequests);
  }

  if (rawSql.includes('INSERT INTO payout_requests')) {
    const newReq = {
      id: values[0],
      user_id: values[1],
      user_email: values[2],
      user_name: values[3],
      amount: parseFloat(values[4]),
      payout_rail: values[5],
      payout_details: values[6],
      status: values[7] || 'Pending',
      created_at: new Date().toISOString(),
      processed_at: null
    };
    inMemoryPayoutRequests.unshift(newReq);
    return Promise.resolve([newReq]);
  }

  if (rawSql.includes('UPDATE payout_requests')) {
    const statusVal = values[0];
    const idVal = values[1];
    const req = inMemoryPayoutRequests.find(r => r.id === idVal);
    if (req) {
      req.status = statusVal;
      if (statusVal === 'Processed') {
        req.processed_at = new Date().toISOString();
      }
    }
    return Promise.resolve([]);
  }

  if (rawSql.includes('FROM independent')) {
    const active = inMemoryIndependentApps.filter(a => a.is_active !== false);
    return Promise.resolve(active);
  }

  if (rawSql.includes('INSERT INTO independent')) {
    const newApp = {
      id: values[0],
      appName: values[1],
      app_name: values[1],
      appImage: values[2],
      app_image: values[2],
      description: values[3],
      referralCode: values[4],
      referral_code: values[4],
      appLink: values[5],
      app_link: values[5],
      rewardBadge: values[6],
      reward_badge: values[6],
      category: values[7] || 'Finance & Demat',
      isActive: true,
      is_active: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const existingIndex = inMemoryIndependentApps.findIndex(a => a.id === values[0]);
    if (existingIndex !== -1) {
      inMemoryIndependentApps[existingIndex] = newApp;
    } else {
      inMemoryIndependentApps.unshift(newApp);
    }
    return Promise.resolve([newApp]);
  }

  if (rawSql.includes('UPDATE independent')) {
    const appName = values[0];
    const appImage = values[1];
    const description = values[2];
    const referralCode = values[3];
    const appLink = values[4];
    const rewardBadge = values[5];
    const category = values[6];
    const idVal = values[7];

    const app = inMemoryIndependentApps.find(a => a.id === idVal);
    if (app) {
      app.appName = appName;
      app.app_name = appName;
      app.appImage = appImage;
      app.app_image = appImage;
      app.description = description;
      app.referralCode = referralCode;
      app.referral_code = referralCode;
      app.appLink = appLink;
      app.app_link = appLink;
      app.rewardBadge = rewardBadge;
      app.reward_badge = rewardBadge;
      if (category) app.category = category;
    }
    return Promise.resolve([]);
  }

  if (rawSql.includes('DELETE FROM independent')) {
    const idVal = values[0];
    const idx = inMemoryIndependentApps.findIndex(a => a.id === idVal);
    if (idx !== -1) inMemoryIndependentApps.splice(idx, 1);
    return Promise.resolve([]);
  }

  return Promise.resolve([]);
}

// Export resilient Neon SQL query runner
export const sql: NeonQueryFunction<false, false> = new Proxy(
  ((...args: any[]) => {
    if (!client) {
      return executeFallbackSql(args[0], ...(args.slice(1)));
    }
    return (client as any)(...args);
  }) as any,
  {
    get(target, prop, receiver) {
      if (client && prop in client) {
        return (client as any)[prop];
      }
      return Reflect.get(target, prop, receiver);
    }
  }
);
