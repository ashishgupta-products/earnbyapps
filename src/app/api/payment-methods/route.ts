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
  }
];

export function getFallbackPaymentMethods(country?: string | null) {
  return DEFAULT_PAYMENT_METHODS;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'India';

  if (!isDbConfigured) {
    return NextResponse.json(getFallbackPaymentMethods(country));
  }

  try {
    // Query active Indian payment methods
    const countryMethods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      WHERE is_active = true AND LOWER(target_country) = ${country.toLowerCase()}
      ORDER BY id ASC
    `;

    if (countryMethods.length > 0) {
      return NextResponse.json(countryMethods);
    }

    // Otherwise all active methods or defaults
    const allMethods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      WHERE is_active = true
      ORDER BY id ASC
    `;

    return NextResponse.json(allMethods.length > 0 ? allMethods : DEFAULT_PAYMENT_METHODS);
  } catch (error: any) {
    console.warn('Database error in GET /api/payment-methods, using fallback:', error.message);
    return NextResponse.json(getFallbackPaymentMethods(country));
  }
}
