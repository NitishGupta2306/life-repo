import { pgTable, text, uuid, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'urgent']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'completed', 'cancelled']);
export const templateCategoryEnum = pgEnum('template_category', ['dashboard', 'website', 'mobile', 'automation', 'learning', 'business', 'creative', 'research']);

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  area: text('area').notNull(), // Work, Personal, Health, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  checklist: text('checklist'), // JSON array of checklist items
  priority: priorityEnum('priority').default('medium').notNull(),
  difficulty: difficultyEnum('difficulty').default('medium').notNull(),
  dueDate: timestamp('due_date'),
  status: taskStatusEnum('status').default('todo').notNull(),
  area: text('area').notNull(), // Inherited from project
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Notes table
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  area: text('area').notNull(), // Inherited from project
  subAreas: text('sub_areas'), // JSON array of additional areas this note applies to
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Idea dumps table (for processing)
export const ideaDumps = pgTable('idea_dumps', {
  id: uuid('id').defaultRandom().primaryKey(),
  rawContent: text('raw_content').notNull(),
  processedContent: text('processed_content'),
  processingStatus: text('processing_status').default('pending').notNull(), // pending, processing, completed, failed
  resultType: text('result_type'), // task, note
  resultId: uuid('result_id'), // ID of created task or note
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

// Project templates table
export const projectTemplates = pgTable('project_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: templateCategoryEnum('category').notNull(),
  area: text('area').notNull(), // Work, Personal, Learning, etc.
  technologies: text('technologies'), // JSON array of tech stack
  estimatedDuration: text('estimated_duration'), // e.g., "2-3 weeks", "1 month"
  difficulty: difficultyEnum('difficulty').default('medium').notNull(),
  taskTemplate: text('task_template'), // JSON template for initial tasks
  checklistTemplate: text('checklist_template'), // JSON template for checklist items
  prerequisites: text('prerequisites'), // JSON array of required skills/tools
  learningObjectives: text('learning_objectives'), // JSON array of what you'll learn
  popularityScore: integer('popularity_score').default(0).notNull(), // For ranking templates
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by').default('system').notNull(), // system, user, community
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type IdeaDump = typeof ideaDumps.$inferSelect;
export type NewIdeaDump = typeof ideaDumps.$inferInsert;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type NewProjectTemplate = typeof projectTemplates.$inferInsert;