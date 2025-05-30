import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { groups, subscriptions } from '@/lib/db/schema';
import { and, desc, eq, ilike, lt, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  search: z.string().optional(),
  service: z.string().optional(),
  maxPrice: z.coerce.number().optional(),
  availableSpots: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  return withAuth(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const query = querySchema.parse(Object.fromEntries(searchParams));

      const offset = (query.page - 1) * query.limit;

      // Base query for public subscriptions
      const whereConditions = [
        eq(subscriptions.isPublic, true),
        eq(subscriptions.isActive, true),
      ];

      // Add search filter
      if (query.search) {
        whereConditions.push(
          or(
            ilike(subscriptions.name, `%${query.search}%`),
            ilike(subscriptions.serviceName, `%${query.search}%`),
            ilike(subscriptions.description, `%${query.search}%`)
          )!
        );
      }

      // Add service filter
      if (query.service) {
        whereConditions.push(ilike(subscriptions.serviceName, `%${query.service}%`));
      }

      // Add price filter
      if (query.maxPrice) {
        whereConditions.push(lt(subscriptions.totalPrice, query.maxPrice.toString()));
      }

      // Add available spots filter
      if (query.availableSpots) {
        whereConditions.push(lt(subscriptions.currentMembers || 0, subscriptions.maxMembers || 0));
      }

      const results = await db
        .select({
          id: subscriptions.id,
          name: subscriptions.name,
          serviceName: subscriptions.serviceName,
          description: subscriptions.description,
          totalPrice: subscriptions.totalPrice,
          currency: subscriptions.currency,
          maxMembers: subscriptions.maxMembers,
          currentMembers: subscriptions.currentMembers,
          renewalDate: subscriptions.renewalDate,
          createdAt: subscriptions.createdAt,
          group: {
            id: groups.id,
            name: groups.name,
          }
        })
        .from(subscriptions)
        .leftJoin(groups, eq(subscriptions.groupId, groups.id))
        .where(and(...whereConditions))
        .orderBy(desc(subscriptions.createdAt))
        .limit(query.limit)
        .offset(offset);

      // Calculate price per member for each subscription
      const subscriptionsWithPricing = results.map(sub => ({
        ...sub,
        pricePerMember: sub.totalPrice ? Number(sub.totalPrice) / (sub.maxMembers || 1) : 0,
        availableSpots: sub.maxMembers ? sub.maxMembers - (sub.currentMembers || 0) : 0,
        percentageFilled: sub.maxMembers ? ((sub.currentMembers || 0) / sub.maxMembers) * 100 : 0,
      }));

      // Get total count for pagination
      const totalCount = await db
        .select({ count: subscriptions.id })
        .from(subscriptions)
        .where(and(...whereConditions));

      return NextResponse.json({
        subscriptions: subscriptionsWithPricing,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / query.limit),
        },
      });
    } catch (error) {
      console.error('Error fetching public subscriptions:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}