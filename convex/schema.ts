import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  sessions: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    course: v.string(),
    level: v.string(),
    institutionType: v.string(),
    questionsAnswered: v.number(),
    correct: v.number(),
    wrong: v.number(),
    score: v.number(),
    mode: v.union(v.literal('lab'), v.literal('mock')),
    grade: v.optional(v.string()),
    timestamp: v.number(),
  }).index('by_user', ['userId']),
});
