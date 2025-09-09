import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { eq, desc, and, gte } from 'drizzle-orm';

// Define gentle reminders table (this might be moved to schema later)
const gentleReminders = pgTable('gentle_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  reminderText: text('reminder_text').notNull(),
  reminderType: text('reminder_type').notNull(), // 'gentle_nudge', 'celebration', 'encouragement'
  isActive: boolean('is_active').notNull().default(true),
  scheduledFor: timestamp('scheduled_for'),
  wasShown: boolean('was_shown').notNull().default(false),
  priority: integer('priority').notNull().default(1), // 1-5 scale
  contextTags: text('context_tags').array().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export async function GET() {
  try {
    // Get active reminders that haven't been shown yet
    const activeReminders = await db
      .select()
      .from(gentleReminders)
      .where(
        and(
          eq(gentleReminders.isActive, true),
          eq(gentleReminders.wasShown, false)
        )
      )
      .orderBy(desc(gentleReminders.priority), desc(gentleReminders.createdAt))
      .limit(5); // Only show top 5 most important reminders

    // Get recent reminders for history
    const recentReminders = await db
      .select()
      .from(gentleReminders)
      .orderBy(desc(gentleReminders.createdAt))
      .limit(20);

    return NextResponse.json({
      activeReminders,
      recentReminders,
      pendingCount: activeReminders.length
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { reminderText, reminderType = 'gentle_nudge', priority = 1, contextTags = [], scheduledFor } = body;

      if (!reminderText) {
        return NextResponse.json(
          { error: 'Reminder text is required' },
          { status: 400 }
        );
      }

      const newReminder = await db
        .insert(gentleReminders)
        .values({
          reminderText,
          reminderType,
          priority,
          contextTags,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        })
        .returning();

      return NextResponse.json({
        message: 'Gentle reminder created',
        reminder: newReminder[0]
      });
    }

    if (action === 'mark_shown' && body.reminderId) {
      // Mark a reminder as shown
      const updatedReminder = await db
        .update(gentleReminders)
        .set({
          wasShown: true,
        })
        .where(eq(gentleReminders.id, body.reminderId))
        .returning();

      return NextResponse.json({
        message: 'Reminder marked as shown',
        reminder: updatedReminder[0]
      });
    }

    if (action === 'dismiss' && body.reminderId) {
      // Dismiss a reminder (mark as inactive)
      const dismissedReminder = await db
        .update(gentleReminders)
        .set({
          isActive: false,
          wasShown: true,
        })
        .where(eq(gentleReminders.id, body.reminderId))
        .returning();

      return NextResponse.json({
        message: 'Reminder dismissed',
        reminder: dismissedReminder[0]
      });
    }

    if (action === 'create_encouragement') {
      // Create an encouragement reminder based on recent activity
      const encouragements = [
        "You're doing great! Every small step counts 💙",
        "Remember: progress isn't always linear, and that's okay",
        "Your ADHD brain is creative and unique - embrace it!",
        "Taking breaks is productive too. You deserve rest.",
        "You've overcome challenges before, you can do it again",
        "Your effort matters, even when the results aren't visible yet"
      ];

      const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

      const encouragementReminder = await db
        .insert(gentleReminders)
        .values({
          reminderText: randomEncouragement,
          reminderType: 'encouragement',
          priority: 3,
          contextTags: ['motivation', 'self-care'],
        })
        .returning();

      return NextResponse.json({
        message: 'Encouragement reminder created',
        reminder: encouragementReminder[0]
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing reminders:', error);
    return NextResponse.json(
      { error: 'Failed to manage reminders' },
      { status: 500 }
    );
  }
}