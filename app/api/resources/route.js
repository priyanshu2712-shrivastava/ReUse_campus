import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resource from '@/lib/models/Resource';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const location = searchParams.get('location');
    const ownerRole = searchParams.get('ownerRole');
    const status = searchParams.get('status');

    const query = {};

    // Filter by active statuses (default to available & partially reserved for catalog browsing)
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['available', 'reserved'] };
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    if (ownerRole && ownerRole !== 'all') {
      if (['student', 'department', 'user'].includes(ownerRole)) {
        query.ownerRole = 'user';
      } else if (ownerRole === 'admin') {
        query.ownerRole = 'admin';
      }
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { subCategory: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query)
      .populate('owner', 'name email role departmentName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Fetch resources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campus resources' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const {
      title,
      description,
      category,
      subCategory,
      quantity,
      condition,
      location,
      pickupInstructions,
      imageUrl,
    } = body;

    if (!title || !description || !category || !quantity || !condition || !location) {
      return NextResponse.json(
        { error: 'Please provide all required resource specifications' },
        { status: 400 }
      );
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive integer' },
        { status: 400 }
      );
    }

    const newResource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      category,
      subCategory: subCategory ? subCategory.trim() : '',
      quantity: numQuantity,
      availableQuantity: numQuantity,
      condition,
      location: location.trim(),
      pickupInstructions: pickupInstructions ? pickupInstructions.trim() : 'Coordinate directly upon approval.',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      owner: user._id,
      ownerRole: (user.role === 'admin' || body.ownerRole === 'admin') ? 'admin' : 'user',
      status: 'available',
    });

    return NextResponse.json({
      message: 'Resource listed successfully',
      resource: newResource,
    });
  } catch (error) {
    console.error('Create resource error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list resource' },
      { status: 500 }
    );
  }
}
