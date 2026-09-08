import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../lib/db';

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: 1,
    name: 'UPI ID',
    label: '🇮🇳 UPI ID (GPay / PhonePe / BHIM / Paytm)',
    placeholder: 'e.g. yourname@oksbi / 9876543210@paytm',
    targetCountry: 'India',
    isActive: true,
    fields: null,
    placeholderType: 'text'
  },
  {
    id: 2,
    name: 'Paytm Wallet Number',
    label: '📲 Paytm Wallet Mobile Number',
    placeholder: 'e.g. 9876543210',
    targetCountry: 'India',
    isActive: true,
    fields: null,
    placeholderType: 'text'
  },
  {
    id: 3,
    name: 'Bank Transfer (India)',
    label: '🏦 Bank Account (A/C & IFSC)',
    placeholder: 'e.g. Account: 123456789, IFSC: SBIN0001234',
    targetCountry: 'India',
    isActive: true,
    fields: null,
    placeholderType: 'text'
  },
  {
    id: 4,
    name: 'PayPal Email',
    label: '💳 PayPal Email',
    placeholder: 'e.g. billing@paypal.com',
    targetCountry: 'Global',
    isActive: true,
    fields: null,
    placeholderType: 'text'
  },
  {
    id: 5,
    name: 'Crypto Wallet (USDT/USDC)',
    label: '🪙 Crypto Wallet Address (USDT/USDC)',
    placeholder: 'e.g. TRC20 or BEP20 address',
    targetCountry: 'Global',
    isActive: true,
    fields: null,
    placeholderType: 'text'
  },
  {
    id: 6,
    name: 'Bank Transfer (International)',
    label: '🏦 Bank Wire (IBAN & SWIFT)',
    placeholder: 'e.g. IBAN: GB29..., SWIFT: MIDL...',
    targetCountry: 'Global',
    isActive: true,
    fields: null,
    placeholderType: 'text'
  }
];

export function getFallbackPaymentMethods(country: string | null) {
  if (!country) return DEFAULT_PAYMENT_METHODS;
  const match = DEFAULT_PAYMENT_METHODS.filter(
    m => m.targetCountry.toLowerCase() === country.toLowerCase()
  );
  if (match.length > 0) return match;
  return DEFAULT_PAYMENT_METHODS.filter(
    m => m.targetCountry.toLowerCase() === 'global'
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!isDbConfigured) {
    return NextResponse.json(getFallbackPaymentMethods(country));
  }

  try {
    if (!country) {
      const methods = await sql`
        SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
        FROM payment_methods
        WHERE is_active = true
        ORDER BY id ASC
      `;
      return NextResponse.json(methods.length > 0 ? methods : DEFAULT_PAYMENT_METHODS);
    }

    // Query active methods matching target country
    const countryMethods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      WHERE is_active = true AND LOWER(target_country) = ${country.toLowerCase()}
      ORDER BY id ASC
    `;

    if (countryMethods.length > 0) {
      return NextResponse.json(countryMethods);
    }

    // Fallback to Global methods if no country-specific options exist
    const globalMethods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      WHERE is_active = true AND LOWER(target_country) = 'global'
      ORDER BY id ASC
    `;

    if (globalMethods.length > 0) {
      return NextResponse.json(globalMethods);
    }

    return NextResponse.json(getFallbackPaymentMethods(country));
  } catch (error: any) {
    console.warn('Database error in GET /api/payment-methods, using fallback:', error.message);
    return NextResponse.json(getFallbackPaymentMethods(country));
  }
}
