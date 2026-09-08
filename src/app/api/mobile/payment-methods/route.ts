import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../../lib/db';
import { getFallbackPaymentMethods, DEFAULT_PAYMENT_METHODS } from '../../payment-methods/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!isDbConfigured) {
    return NextResponse.json({ success: true, methods: getFallbackPaymentMethods(country) });
  }

  try {
    if (!country) {
      const methods = await sql`
        SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
        FROM payment_methods
        WHERE is_active = true
        ORDER BY id ASC
      `;
      return NextResponse.json({ success: true, methods: methods.length > 0 ? methods : DEFAULT_PAYMENT_METHODS });
    }

    // Query active methods matching target country
    const countryMethods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      WHERE is_active = true AND LOWER(target_country) = ${country.toLowerCase()}
      ORDER BY id ASC
    `;

    if (countryMethods.length > 0) {
      return NextResponse.json({ success: true, methods: countryMethods });
    }

    // Fallback to Global methods if no country-specific options exist
    const globalMethods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      WHERE is_active = true AND LOWER(target_country) = 'global'
      ORDER BY id ASC
    `;

    if (globalMethods.length > 0) {
      return NextResponse.json({ success: true, methods: globalMethods });
    }

    return NextResponse.json({ success: true, methods: getFallbackPaymentMethods(country) });
  } catch (error: any) {
    console.warn('Database error in GET /api/mobile/payment-methods, using fallback:', error.message);
    return NextResponse.json({ success: true, methods: getFallbackPaymentMethods(country) });
  }
}
