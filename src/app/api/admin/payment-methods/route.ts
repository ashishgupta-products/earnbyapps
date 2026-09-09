import { NextResponse } from 'next/server';
import { sql, isDbConfigured } from '../../../../lib/db';
import { DEFAULT_PAYMENT_METHODS } from '../../payment-methods/route';

export async function GET() {
  if (!isDbConfigured) {
    return NextResponse.json(DEFAULT_PAYMENT_METHODS);
  }

  try {
    // Ensure table and column exist
    await sql`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        placeholder VARCHAR(255) NOT NULL,
        target_country VARCHAR(100) DEFAULT 'India',
        is_active BOOLEAN DEFAULT true
      );
    `;
    await sql`
      ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS fields TEXT;
    `;
    await sql`
      ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS placeholder_type VARCHAR(50) DEFAULT 'text';
    `;

    const methods = await sql`
      SELECT id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
      FROM payment_methods
      ORDER BY id ASC
    `;
    return NextResponse.json(methods.length > 0 ? methods : DEFAULT_PAYMENT_METHODS);
  } catch (error: any) {
    console.warn('Database error in GET /api/admin/payment-methods, using defaults:', error.message);
    return NextResponse.json(DEFAULT_PAYMENT_METHODS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, label, placeholder, targetCountry, isActive, fields, placeholderType } = body;

    if (!name || !label || !placeholder) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const finalTargetCountry = targetCountry || 'India';
    const active = isActive !== undefined ? isActive : true;
    const fieldsStr = fields ? (typeof fields === 'string' ? fields : JSON.stringify(fields)) : null;
    const pType = placeholderType || 'text';

    const result = await sql`
      INSERT INTO payment_methods (name, label, placeholder, target_country, is_active, fields, placeholder_type)
      VALUES (${name}, ${label}, ${placeholder}, ${finalTargetCountry}, ${active}, ${fieldsStr}, ${pType})
      RETURNING id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error in POST /api/admin/payment-methods:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, label, placeholder, targetCountry, isActive, fields, placeholderType } = body;

    if (!id) {
      return NextResponse.json({ error: 'Method ID is required' }, { status: 400 });
    }

    const existing = await sql`SELECT * FROM payment_methods WHERE id = ${parseInt(id)}`;
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
    }

    const updatedName = name !== undefined ? name : existing[0].name;
    const updatedLabel = label !== undefined ? label : existing[0].label;
    const updatedPlaceholder = placeholder !== undefined ? placeholder : existing[0].placeholder;
    const updatedTargetCountry = targetCountry !== undefined ? targetCountry : existing[0].target_country;
    const updatedIsActive = isActive !== undefined ? isActive : existing[0].is_active;
    const updatedFields = fields !== undefined ? (typeof fields === 'string' ? fields : JSON.stringify(fields)) : existing[0].fields;
    const updatedPlaceholderType = placeholderType !== undefined ? placeholderType : (existing[0].placeholder_type || 'text');

    const result = await sql`
      UPDATE payment_methods
      SET name = ${updatedName},
          label = ${updatedLabel},
          placeholder = ${updatedPlaceholder},
          target_country = ${updatedTargetCountry},
          is_active = ${updatedIsActive},
          fields = ${updatedFields},
          placeholder_type = ${updatedPlaceholderType}
      WHERE id = ${parseInt(id)}
      RETURNING id, name, label, placeholder, target_country as "targetCountry", is_active as "isActive", fields, placeholder_type as "placeholderType"
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error in PUT /api/admin/payment-methods:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Method ID is required' }, { status: 400 });
    }

    await sql`
      DELETE FROM payment_methods
      WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/payment-methods:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
