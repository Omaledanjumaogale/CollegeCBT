import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Sync institutions list into the database.
 */
export const syncInstitutions = mutation({
  args: {
    data: v.array(v.object({
      type: v.string(),
      category: v.string(),
      name: v.string(),
      state: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query('institutions')
        .withIndex('by_name', q => q.eq('name', item.name))
        .unique();
      
      if (existing) {
        await ctx.db.patch(existing._id, item);
      } else {
        await ctx.db.insert('institutions', item);
      }
    }
    return { success: true, count: args.data.length };
  }
});

/**
 * Sync curriculum entries.
 */
export const syncCurriculum = mutation({
  args: {
    data: v.array(v.object({
      institutionType: v.string(),
      faculty: v.string(),
      department: v.string(),
      level: v.string(),
      course: v.string(),
      topics: v.array(v.string())
    }))
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query('curriculum')
        .withIndex('by_course', q => q.eq('course', item.course))
        .filter(q => q.and(
          q.eq(q.field('level'), item.level),
          q.eq(q.field('department'), item.department)
        ))
        .unique();
      
      if (existing) {
        await ctx.db.patch(existing._id, item);
      } else {
        await ctx.db.insert('curriculum', item);
      }
    }
    return { success: true, count: args.data.length };
  }
});

// ── SEEDING ──────────────────────────────────────────────────────────────────

export const seedData = mutation({
  args: {
    institutions: v.array(v.object({
      type: v.string(),
      category: v.string(),
      name: v.string(),
    })),
    curriculum: v.array(v.object({
      institutionType: v.string(),
      faculty: v.string(),
      department: v.string(),
      level: v.string(),
      course: v.string(),
      topics: v.array(v.string())
    }))
  },
  handler: async (ctx, args) => {
    let instCount = 0;
    let currCount = 0;

    for (const inst of args.institutions) {
      const existing = await ctx.db
        .query('institutions')
        .withIndex('by_name', q => q.eq('name', inst.name))
        .unique();
      if (!existing) {
        await ctx.db.insert('institutions', inst);
        instCount++;
      }
    }

    for (const curr of args.curriculum) {
      const existing = await ctx.db
        .query('curriculum')
        .withIndex('by_course', q => q.eq('course', curr.course))
        .filter(q => q.and(
          q.eq(q.field('level'), curr.level),
          q.eq(q.field('department'), curr.department)
        ))
        .unique();
      if (!existing) {
        await ctx.db.insert('curriculum', curr);
        currCount++;
      }
    }

    return { instCount, currCount };
  }
});

// ── GETTERS ──────────────────────────────────────────────────────────────────

export const getInstitutionTypes = query({
  handler: async (ctx) => {
    return ['University', 'Polytechnic', 'College of Education', 'Monotechnic/Specialized'];
  }
});

export const getInstitutionsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('institutions')
      .withIndex('by_type', q => q.eq('type', args.type))
      .collect();
  }
});

export const getFaculties = query({
  args: { institutionType: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query('curriculum')
      .filter(q => q.eq(q.field('institutionType'), args.institutionType))
      .collect();
    return Array.from(new Set(all.map(c => c.faculty))).sort();
  }
});

export const getDepartments = query({
  args: { institutionType: v.string(), faculty: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query('curriculum')
      .withIndex('by_faculty', q => q.eq('faculty', args.faculty))
      .filter(q => q.eq(q.field('institutionType'), args.institutionType))
      .collect();
    return Array.from(new Set(all.map(c => c.department))).sort();
  }
});

export const getLevels = query({
  args: { institutionType: v.string(), faculty: v.string(), department: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query('curriculum')
      .withIndex('by_department', q => q.eq('department', args.department))
      .filter(q => q.and(
        q.eq(q.field('institutionType'), args.institutionType),
        q.eq(q.field('faculty'), args.faculty)
      ))
      .collect();
    return Array.from(new Set(all.map(c => c.level))).sort();
  }
});

export const getCourses = query({
  args: { institutionType: v.string(), faculty: v.string(), department: v.string(), level: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('curriculum')
      .withIndex('by_department', q => q.eq('department', args.department))
      .filter(q => q.and(
        q.eq(q.field('institutionType'), args.institutionType),
        q.eq(q.field('faculty'), args.faculty),
        q.eq(q.field('level'), args.level)
      ))
      .collect();
  }
});

// ── QUESTION BANK ────────────────────────────────────────────────────────────

export const saveGeneratedQuestion = mutation({
  args: {
    course: v.string(),
    level: v.string(),
    institutionType: v.string(),
    topic: v.string(),
    difficulty: v.string(),
    type: v.union(v.literal('MCQ'), v.literal('Theory')),
    content: v.string(),
    provider: v.string(),
    isOther: v.boolean(),
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('questionBank', {
      ...args,
      hitCount: 0,
      timestamp: Date.now()
    });
  }
});

export const getRandomQuestion = query({
  args: {
    course: v.string(),
    level: v.string(),
    institutionType: v.string(),
    topic: v.optional(v.string()),
    type: v.union(v.literal('MCQ'), v.literal('Theory')),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query('questionBank')
      .withIndex('by_course', q => q.eq('course', args.course))
      .filter(q => q.and(
        q.eq(q.field('level'), args.level),
        q.eq(q.field('institutionType'), args.institutionType),
        q.eq(q.field('type'), args.type)
      ));
    
    if (args.topic) {
      q = q.filter(q => q.eq(q.field('topic'), args.topic));
    }

    const matches = await q.collect();
    if (matches.length === 0) return null;
    return matches[Math.floor(Math.random() * matches.length)];
  }
});

export const incrementQuestionHit = mutation({
  args: { id: v.id('questionBank') },
  handler: async (ctx, args) => {
    const q = await ctx.db.get(args.id);
    if (q) {
      await ctx.db.patch(args.id, { hitCount: (q.hitCount || 0) + 1 });
    }
  }
});
