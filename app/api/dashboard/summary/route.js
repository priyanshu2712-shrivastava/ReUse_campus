import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Resource from '@/lib/models/Resource';
import ResourceRequest from '@/lib/models/ResourceRequest';
import Transfer from '@/lib/models/Transfer';
import { getAuthUser } from '@/lib/auth';
import { CAMPUS_CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const isAdmin = user.role === 'admin';

    if (isAdmin) {
      // Campus-wide analytics for Admin
      const [
        totalUsers,
        usersCount,
        adminsCount,
        totalResources,
        availableResources,
        pendingRequestsCount,
        completedTransfers,
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: { $ne: 'admin' } }),
        User.countDocuments({ role: 'admin' }),
        Resource.countDocuments({ status: { $ne: 'archived' } }),
        Resource.countDocuments({ status: 'available', availableQuantity: { $gt: 0 } }),
        ResourceRequest.countDocuments({ status: 'pending' }),
        Transfer.find({ status: 'completed' })
          .populate('resource', 'title category')
          .populate('giver', 'name departmentName role')
          .populate('receiver', 'name departmentName role collegeId')
          .sort({ completedAt: -1 })
          .lean(),
      ]);

      let totalCampusSavings = 0;
      let totalCampusCarbon = 0;
      let totalCampusWaste = 0;
      let totalUnitsReused = 0;

      const categoryDistribution = {};
      CAMPUS_CATEGORIES.forEach((c) => {
        categoryDistribution[c.id] = { name: c.name, count: 0, unitsReused: 0 };
      });

      completedTransfers.forEach((t) => {
        const units = t.quantityTransferred || 1;
        totalUnitsReused += units;
        totalCampusSavings += t.impact?.estimatedSavingsINR || 0;
        totalCampusCarbon += t.impact?.estimatedCarbonSavedKg || 0;
        totalCampusWaste += t.impact?.wasteDivertedKg || 0;

        const catId = t.resource?.category || 'other';
        if (categoryDistribution[catId]) {
          categoryDistribution[catId].unitsReused += units;
          categoryDistribution[catId].count += 1;
        }
      });

      return NextResponse.json({
        role: 'admin',
        user: {
          name: user.name,
          email: user.email,
          role: 'admin',
          departmentName: user.departmentName,
        },
        kpis: {
          totalUsers,
          usersCount,
          adminsCount,
          totalResources,
          availableResources,
          pendingRequestsCount,
          completedTransfersCount: completedTransfers.length,
          totalUnitsReused,
          savingsINR: totalCampusSavings,
          carbonKg: totalCampusCarbon,
          wasteKg: totalCampusWaste,
        },
        categoryDistribution: Object.values(categoryDistribution),
        recentTransfers: completedTransfers.slice(0, 6),
      });
    }

    // Default: Campus Member Dashboard (role: 'user')
    const [myListings, myRequests, myTransfersAsReceiver, myTransfersAsGiver] = await Promise.all([
      Resource.find({ owner: user._id, status: { $ne: 'archived' } }).lean(),
      ResourceRequest.find({ requester: user._id })
        .populate({
          path: 'resource',
          select: 'title category subCategory condition location pickupInstructions imageUrl owner status',
          populate: { path: 'owner', select: 'name email role departmentName phone' },
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Transfer.find({ receiver: user._id, status: 'completed' })
        .populate('resource', 'title category')
        .populate('giver', 'name email departmentName')
        .sort({ completedAt: -1 })
        .lean(),
      Transfer.find({ giver: user._id, status: 'completed' })
        .populate('resource', 'title category')
        .populate('receiver', 'name email collegeId departmentName')
        .sort({ completedAt: -1 })
        .lean(),
    ]);

    const userResourceIds = myListings.map((r) => r._id);

    // Inbound requests for this member's listed resources
    const [pendingInbound, approvedInbound] = userResourceIds.length > 0
      ? await Promise.all([
          ResourceRequest.find({ resource: { $in: userResourceIds }, status: 'pending' })
            .populate('requester', 'name email collegeId departmentName phone')
            .populate('resource', 'title category availableQuantity quantity location')
            .sort({ createdAt: -1 })
            .lean(),
          ResourceRequest.find({ resource: { $in: userResourceIds }, status: { $in: ['approved', 'ready_for_pickup'] } })
            .populate('requester', 'name email collegeId departmentName phone')
            .populate('resource', 'title category location pickupInstructions')
            .sort({ createdAt: -1 })
            .lean(),
        ])
      : [[], []];

    // Check transfers for approved inbound requests to see if handover is pending
    const approvedInboundIds = approvedInbound.map((r) => r._id);
    const inboundTransfers = approvedInboundIds.length > 0
      ? await Transfer.find({ request: { $in: approvedInboundIds } }).lean()
      : [];
    const inboundTransferMap = {};
    inboundTransfers.forEach((t) => {
      inboundTransferMap[t.request.toString()] = t;
    });

    // Active outbound requests made by this user
    const activeOutboundRequests = myRequests.filter((r) =>
      ['pending', 'approved', 'ready_for_pickup'].includes(r.status)
    );
    const activeOutboundIds = activeOutboundRequests.map((r) => r._id);
    const outboundTransfers = activeOutboundIds.length > 0
      ? await Transfer.find({ request: { $in: activeOutboundIds } }).lean()
      : [];
    const outboundTransferMap = {};
    outboundTransfers.forEach((t) => {
      outboundTransferMap[t.request.toString()] = t;
    });

    // Sum inventory units
    let availableUnits = 0;
    let totalUnits = 0;
    myListings.forEach((r) => {
      availableUnits += r.availableQuantity || 0;
      totalUnits += r.quantity || 0;
    });

    // Calculate personal savings & environmental impact
    let totalSavingsINR = 0;
    let totalCarbonKg = 0;
    let totalWasteKg = 0;
    let itemsReceivedCount = 0;

    myTransfersAsReceiver.forEach((t) => {
      itemsReceivedCount += t.quantityTransferred || 1;
      totalSavingsINR += t.impact?.estimatedSavingsINR || 0;
      totalCarbonKg += t.impact?.estimatedCarbonSavedKg || 0;
      totalWasteKg += t.impact?.wasteDivertedKg || 0;
    });

    myTransfersAsGiver.forEach((t) => {
      totalSavingsINR += t.impact?.estimatedSavingsINR || 0;
      totalCarbonKg += t.impact?.estimatedCarbonSavedKg || 0;
      totalWasteKg += t.impact?.wasteDivertedKg || 0;
    });

    // Compile Action Required items
    const actionItems = [];

    // 1) Inbound requests waiting for this user's decision
    pendingInbound.forEach((req) => {
      actionItems.push({
        id: `review-${req._id}`,
        type: 'decision_needed',
        severity: 'urgent',
        title: `Request from ${req.requester?.name || 'Campus Member'}`,
        subtitle: `Wants ${req.requestedQuantity}x "${req.resource?.title}" • Purpose: "${req.purpose || 'Academic reuse'}"`,
        actionLabel: 'Adjudicate',
        actionHref: '/dashboard/requests/incoming',
        timestamp: req.createdAt,
      });
    });

    // 2) Approved inbound items needing physical handover confirmation
    approvedInbound.forEach((req) => {
      const transfer = inboundTransferMap[req._id.toString()];
      if (!transfer || !transfer.giverConfirmedAt) {
        actionItems.push({
          id: `handover-${req._id}`,
          type: 'handover_pending',
          severity: 'attention',
          title: `Handover Sign-off: ${req.resource?.title}`,
          subtitle: `Recipient: ${req.requester?.name} (${req.requester?.collegeId || req.requester?.departmentName || req.requester?.email})`,
          actionLabel: 'Confirm Handover',
          actionHref: '/requests/incoming',
          timestamp: req.pickupScheduledAt || req.updatedAt,
        });
      }
    });

    // 3) Approved outbound requests ready for physical pickup / receipt
    activeOutboundRequests.forEach((req) => {
      if (req.status === 'approved' || req.status === 'ready_for_pickup') {
        actionItems.push({
          id: `pickup-${req._id}`,
          type: 'pickup_pending',
          severity: 'urgent',
          title: `Pickup Ready: ${req.resource?.title || 'Resource'}`,
          subtitle: `Approved by ${req.resource?.owner?.departmentName || req.resource?.owner?.name || 'Custodian'} • Location: ${req.resource?.location || 'Campus'}`,
          actionLabel: 'Confirm Receipt',
          actionHref: '/dashboard/requests/my-requests',
          timestamp: req.updatedAt || req.createdAt,
        });
      }
    });

    return NextResponse.json({
      role: 'user',
      user: {
        name: user.name,
        email: user.email,
        role: 'user',
        departmentName: user.departmentName,
        collegeId: user.collegeId,
        phone: user.phone,
      },
      kpis: {
        activeRequestsCount: activeOutboundRequests.length,
        itemsReceivedCount,
        itemsDonatedCount: myTransfersAsGiver.length,
        myListingsCount: myListings.length,
        availableUnits,
        totalUnits,
        pendingReviewCount: pendingInbound.length,
        handoversPendingCount: approvedInbound.length,
        completedTransfersCount: myTransfersAsGiver.length + myTransfersAsReceiver.length,
        savingsINR: totalSavingsINR,
        carbonKg: totalCarbonKg,
        wasteKg: totalWasteKg,
      },
      actionItems,
      recentRequests: myRequests.slice(0, 5),
      pendingQueue: pendingInbound.slice(0, 5),
      recentCompleted: [...myTransfersAsGiver, ...myTransfersAsReceiver]
        .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
        .slice(0, 5),
    });
  } catch (error) {
    console.error('Dashboard summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to compile dashboard summary', details: error.message },
      { status: 500 }
    );
  }
}
