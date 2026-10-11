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

    const role = user.role;

    if (role === 'student') {
      // 1. Requests made by student
      const [myRequests, myTransfersAsReceiver, myTransfersAsGiver, myListingsCount, incomingToStudent] = await Promise.all([
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
          .sort({ completedAt: -1 })
          .lean(),
        Transfer.find({ giver: user._id, status: 'completed' })
          .populate('resource', 'title category')
          .sort({ completedAt: -1 })
          .lean(),
        Resource.countDocuments({ owner: user._id, status: { $ne: 'archived' } }),
        // Check if student listed peer items and received requests
        Resource.find({ owner: user._id }).select('_id'),
      ]);

      const studentResourceIds = incomingToStudent.map((r) => r._id);
      const incomingRequestsPending = studentResourceIds.length > 0
        ? await ResourceRequest.find({ resource: { $in: studentResourceIds }, status: 'pending' })
            .populate('requester', 'name email collegeId')
            .populate('resource', 'title category')
            .sort({ createdAt: -1 })
            .lean()
        : [];

      // Calculate personal savings & impact
      let personalSavingsINR = 0;
      let personalCarbonKg = 0;
      let personalWasteKg = 0;
      let itemsReceivedCount = 0;

      myTransfersAsReceiver.forEach((t) => {
        itemsReceivedCount += t.quantityTransferred || 1;
        personalSavingsINR += t.impact?.estimatedSavingsINR || 0;
        personalCarbonKg += t.impact?.estimatedCarbonSavedKg || 0;
        personalWasteKg += t.impact?.wasteDivertedKg || 0;
      });

      // Enrich my requests with transfer state to know if pickup is pending
      const activeRequests = myRequests.filter((r) => ['pending', 'approved', 'ready_for_pickup'].includes(r.status));
      const activeReqIds = activeRequests.map((r) => r._id);
      const activeTransfers = await Transfer.find({ request: { $in: activeReqIds } }).lean();
      const transferMap = {};
      activeTransfers.forEach((t) => {
        transferMap[t.request.toString()] = t;
      });

      // Build Action Required items for Student
      const actionItems = [];

      // 1) Approved requests ready for receipt confirmation
      activeRequests.forEach((req) => {
        const transfer = transferMap[req._id.toString()];
        if (req.status === 'approved' || req.status === 'ready_for_pickup') {
          actionItems.push({
            id: `pickup-${req._id}`,
            type: 'pickup_pending',
            severity: 'urgent',
            title: `Pickup Ready: ${req.resource?.title || 'Resource'}`,
            subtitle: `Approved by ${req.resource?.owner?.departmentName || req.resource?.owner?.name || 'Custodian'} • Location: ${req.resource?.location || 'Campus'}`,
            actionLabel: 'Confirm Receipt',
            actionHref: '/requests/my-requests',
            timestamp: req.updatedAt || req.createdAt,
          });
        }
      });

      // 2) Inbound peer requests waiting for student's approval
      incomingRequestsPending.forEach((req) => {
        actionItems.push({
          id: `inbound-${req._id}`,
          type: 'decision_pending',
          severity: 'attention',
          title: `Peer Request: ${req.resource?.title || 'Item'}`,
          subtitle: `Requested by ${req.requester?.name || 'Student'} (${req.requester?.collegeId || 'Roll N/A'})`,
          actionLabel: 'Review Request',
          actionHref: '/requests/incoming',
          timestamp: req.createdAt,
        });
      });

      return NextResponse.json({
        role: 'student',
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          collegeId: user.collegeId,
          phone: user.phone,
        },
        kpis: {
          activeRequestsCount: activeRequests.length,
          itemsReceivedCount,
          itemsDonatedCount: myTransfersAsGiver.length,
          myListingsCount,
          savingsINR: personalSavingsINR,
          carbonKg: personalCarbonKg,
          wasteKg: personalWasteKg,
        },
        actionItems,
        recentRequests: myRequests.slice(0, 5),
      });
    }

    if (role === 'department') {
      // 1. Department Inventory stats
      const [deptResources, deptCompletedTransfers] = await Promise.all([
        Resource.find({ owner: user._id, status: { $ne: 'archived' } }).lean(),
        Transfer.find({ giver: user._id, status: 'completed' })
          .populate('resource', 'title category')
          .populate('receiver', 'name email collegeId departmentName')
          .sort({ completedAt: -1 })
          .lean(),
      ]);

      const deptResourceIds = deptResources.map((r) => r._id);

      // Inbound requests for this department's resources
      const [pendingRequests, approvedRequests] = await Promise.all([
        ResourceRequest.find({ resource: { $in: deptResourceIds }, status: 'pending' })
          .populate('requester', 'name email collegeId departmentName phone')
          .populate('resource', 'title category availableQuantity quantity location')
          .sort({ createdAt: -1 })
          .lean(),
        ResourceRequest.find({ resource: { $in: deptResourceIds }, status: { $in: ['approved', 'ready_for_pickup'] } })
          .populate('requester', 'name email collegeId departmentName phone')
          .populate('resource', 'title category location pickupInstructions')
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      // Check transfers for approved requests to see handover signatures
      const approvedReqIds = approvedRequests.map((r) => r._id);
      const activeTransfers = await Transfer.find({ request: { $in: approvedReqIds } }).lean();
      const transferMap = {};
      activeTransfers.forEach((t) => {
        transferMap[t.request.toString()] = t;
      });

      // Sum quantities
      let availableUnits = 0;
      let totalUnits = 0;
      deptResources.forEach((r) => {
        availableUnits += r.availableQuantity || 0;
        totalUnits += r.quantity || 0;
      });

      // Environmental impact delivered by department
      let departmentSavingsINR = 0;
      let departmentCarbonKg = 0;
      let departmentWasteKg = 0;
      let unitsReusedCount = 0;

      deptCompletedTransfers.forEach((t) => {
        const u = t.quantityTransferred || 1;
        unitsReusedCount += u;
        departmentSavingsINR += t.impact?.estimatedSavingsINR || 0;
        departmentCarbonKg += t.impact?.estimatedCarbonSavedKg || 0;
        departmentWasteKg += t.impact?.wasteDivertedKg || 0;
      });

      // Action Required items for Department
      const actionItems = [];

      // 1) Requests waiting for department approval/rejection
      pendingRequests.forEach((req) => {
        actionItems.push({
          id: `review-${req._id}`,
          type: 'decision_needed',
          severity: 'urgent',
          title: `Request from ${req.requester?.name || 'Applicant'}`,
          subtitle: `Wants ${req.requestedQuantity}x "${req.resource?.title}" • Purpose: "${req.purpose || 'Academic reuse'}"`,
          actionLabel: 'Adjudicate',
          actionHref: '/requests/incoming',
          timestamp: req.createdAt,
        });
      });

      // 2) Approved transfers needing physical handover confirmation
      approvedRequests.forEach((req) => {
        const transfer = transferMap[req._id.toString()];
        if (!transfer || !transfer.giverConfirmedAt) {
          actionItems.push({
            id: `handover-${req._id}`,
            type: 'handover_pending',
            severity: 'attention',
            title: `Handover Sign-off: ${req.resource?.title}`,
            subtitle: `Recipient: ${req.requester?.name} (${req.requester?.collegeId || req.requester?.email})`,
            actionLabel: 'Confirm Handover',
            actionHref: '/requests/incoming',
            timestamp: req.pickupScheduledAt || req.updatedAt,
          });
        }
      });

      return NextResponse.json({
        role: 'department',
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          departmentName: user.departmentName,
          phone: user.phone,
        },
        kpis: {
          totalListings: deptResources.length,
          availableUnits,
          totalUnits,
          pendingReviewCount: pendingRequests.length,
          handoversPendingCount: approvedRequests.length,
          completedTransfersCount: deptCompletedTransfers.length,
          unitsReusedCount,
          savingsINR: departmentSavingsINR,
          carbonKg: departmentCarbonKg,
          wasteKg: departmentWasteKg,
        },
        actionItems,
        pendingQueue: pendingRequests.slice(0, 5),
        recentCompleted: deptCompletedTransfers.slice(0, 5),
      });
    }

    if (role === 'admin') {
      // 1. Campus-wide analytics
      const [
        totalUsers,
        studentsCount,
        departmentsCount,
        totalResources,
        availableResources,
        pendingRequestsCount,
        completedTransfers,
      ] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'department' }),
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
          role: user.role,
          departmentName: user.departmentName,
        },
        kpis: {
          totalUsers,
          studentsCount,
          departmentsCount,
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

    return NextResponse.json({ error: 'Unrecognized user role' }, { status: 400 });
  } catch (error) {
    console.error('Dashboard summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to compile dashboard summary', details: error.message },
      { status: 500 }
    );
  }
}
