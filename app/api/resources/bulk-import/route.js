import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resource from '@/lib/models/Resource';
import { getAuthUser } from '@/lib/auth';
import { validateCsvPayload } from '@/lib/csvHelper';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in as a department representative or authorized user.' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    let itemsToProcess = [];

    // Case 1: Raw CSV text provided
    if (body.csvText) {
      const { validRows, errors } = validateCsvPayload(body.csvText);
      if (validRows.length === 0) {
        return NextResponse.json(
          {
            error: 'No valid rows found in CSV.',
            details: errors,
          },
          { status: 400 }
        );
      }
      itemsToProcess = validRows;
    }
    // Case 2: Pre-parsed items array provided from frontend validator
    else if (Array.isArray(body.items) && body.items.length > 0) {
      itemsToProcess = body.items;
    } else {
      return NextResponse.json(
        { error: 'Invalid request payload. Please provide CSV text or parsed items array.' },
        { status: 400 }
      );
    }

    // Default category fallback images
    const defaultImages = {
      books: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=800&q=80',
      electronics: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      lab_supplies: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      furniture: 'https://images.unsplash.com/photo-1580481077195-c3a82145d875?auto=format&fit=crop&w=800&q=80',
      event_supplies: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
      everyday_reusable: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      other: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    };

    const documentsToInsert = itemsToProcess.map((item) => {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const category = item.category || 'other';

      return {
        title: item.title.trim().slice(0, 140),
        description: (item.description || `${item.title} available for campus reallocation.`).trim().slice(0, 2500),
        category,
        subCategory: (item.subCategory || item.title).trim().slice(0, 120),
        quantity: qty,
        availableQuantity: qty,
        condition: item.condition || 'good',
        location: item.location.trim().slice(0, 200),
        pickupInstructions: (item.pickupInstructions || 'Coordinate directly upon approval.').trim().slice(0, 300),
        imageUrl: item.imageUrl || defaultImages[category] || defaultImages.other,
        owner: user._id,
        ownerRole: user.role === 'admin' ? 'admin' : 'user',
        status: 'available',
      };
    });

    const inserted = await Resource.insertMany(documentsToInsert, { ordered: false });

    const totalQuantity = documentsToInsert.reduce((sum, doc) => sum + doc.quantity, 0);

    return NextResponse.json({
      message: `Successfully registered ${inserted.length} surplus resources (${totalQuantity} total units) to the campus catalogue.`,
      count: inserted.length,
      totalUnits: totalQuantity,
      resources: inserted,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete bulk inventory import' },
      { status: 500 }
    );
  }
}
