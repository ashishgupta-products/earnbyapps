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
    if (rawSql.includes('device_id =') && rawSql.includes('id !=')) {
      return Promise.resolve([]);
    }
    const emailVal = values.find(v => typeof v === 'string' && v.includes('@'));
    if (emailVal) {
      const u = inMemoryUsers.find(x => x.email.toLowerCase() === emailVal.toLowerCase());
      return Promise.resolve(u ? [u] : []);
    }
    return Promise.resolve(inMemoryUsers);
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
