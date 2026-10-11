import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resource from '@/lib/models/Resource';
import ResourceRequest from '@/lib/models/ResourceRequest';
import Transfer from '@/lib/models/Transfer';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const resource = await Resource.findById(params.id).populate(
      'owner',
      'name email role departmentName phone'
    );

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ resource });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const resource = await Resource.findById(params.id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Authorization check: only owner or admin can edit
    const isOwner = resource.owner.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to modify this resource' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, subCategory, quantity, condition, location, pickupInstructions, imageUrl, status, action } = body;

    // Handle Unarchive action or restoring archived resource
    const isUnarchiving = action === 'unarchive' || (status === 'available' && resource.status === 'archived');

    if (isUnarchiving) {
      let restoredQty = resource.previousAvailableQuantity;
      if (!restoredQty || restoredQty <= 0) {
        const completedTransfers = await Transfer.find({ resource: resource._id, status: 'completed' });
        const transferredUnits = completedTransfers.reduce((sum, t) => sum + (t.quantityTransferred || 1), 0);
        restoredQty = Math.max(1, (quantity ? parseInt(quantity, 10) : resource.quantity) - transferredUnits);
      }
      resource.availableQuantity = restoredQty;
      resource.status = 'available';
      resource.previousAvailableQuantity = null;
    } else if (status) {
      if (['available', 'reserved', 'transferred', 'archived', 'under_repair'].includes(status)) {
        if (status === 'archived' && resource.status !== 'archived') {
          resource.previousAvailableQuantity = resource.availableQuantity > 0 ? resource.availableQuantity : resource.quantity;
          resource.availableQuantity = 0;
        }
        resource.status = status;
      }
    }

    if (title) resource.title = title.trim();
    if (description) resource.description = description.trim();
    if (category) resource.category = category;
    if (subCategory !== undefined) resource.subCategory = subCategory.trim();
    if (condition) resource.condition = condition;
    if (location) resource.location = location.trim();
    if (pickupInstructions) resource.pickupInstructions = pickupInstructions.trim();
    if (imageUrl !== undefined) resource.imageUrl = imageUrl.trim();

    if (quantity !== undefined) {
      const numQty = parseInt(quantity, 10);
      if (isNaN(numQty) || numQty < 1 || numQty > 10000) {
        return NextResponse.json(
          { error: 'Quantity must be a valid integer between 1 and 10,000' },
          { status: 400 }
        );
      }
      const qtyDiff = numQty - resource.quantity;
      resource.quantity = numQty;
      if (resource.status !== 'archived') {
        resource.availableQuantity = Math.max(0, resource.availableQuantity + qtyDiff);
      }
    }

    await resource.save();

    return NextResponse.json({
      message: isUnarchiving ? 'Resource unarchived and restored to catalogue' : 'Resource updated successfully',
      resource,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update resource' }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const resource = await Resource.findById(params.id);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const isOwner = resource.owner.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this resource' },
        { status: 403 }
      );
    }

    // 1. Guard against active in-progress requests or pickups
    const activeRequestsCount = await ResourceRequest.countDocuments({
      resource: resource._id,
      status: { $in: ['pending', 'approved', 'ready_for_pickup'] },
    });

    if (activeRequestsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete: This item has active requests or pending pickups. Please resolve them first.' },
        { status: 400 }
      );
    }

    // 2. Check transfer audit history
    const transferCount = await Transfer.countDocuments({ resource: resource._id });

    if (transferCount === 0) {
      // Safe to hard delete: No historical transfers exist
      await ResourceRequest.deleteMany({ resource: resource._id });
      await Resource.findByIdAndDelete(params.id);
      return NextResponse.json({
        message: 'Listing permanently deleted.',
        action: 'deleted',
      });
    } else {
      // Soft-archive to preserve institutional audit and environmental ledger
      resource.previousAvailableQuantity = resource.availableQuantity > 0 ? resource.availableQuantity : resource.quantity;
      resource.status = 'archived';
      resource.availableQuantity = 0;
      await resource.save();

      return NextResponse.json({
        message: 'Listing has completed transfer history. It has been archived and hidden from the catalogue to preserve campus audit records.',
        action: 'archived',
      });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete resource' }, { status: 500 });
  }
}
