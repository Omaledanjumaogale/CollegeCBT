import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// ── User / Student Endpoints ───────────────────────────────────────────────

/**
 * Fetch all support messages for a user (ordered by timestamp)
 */
export const getMessages = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query('supportMessages')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

/**
 * Send a message from a student
 */
export const sendMessage = mutation({
  args: {
    userId: v.string(),
    senderName: v.string(),
    text: v.string(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('supportMessages', {
      userId: args.userId,
      sender: 'student',
      senderName: args.senderName,
      text: args.text,
      attachmentUrl: args.attachmentUrl,
      attachmentName: args.attachmentName,
      timestamp: Date.now(),
    });

    // Auto-respond with a simulated AI/System message to ensure instant feedback
    // if the message isn't already a response.
    if (args.text.toLowerCase().includes('help') || args.text.toLowerCase().includes('error') || args.text.toLowerCase().includes('fail')) {
      await ctx.db.insert('supportMessages', {
        userId: args.userId,
        sender: 'ai',
        senderName: 'E-Win Support AI',
        text: `Hello ${args.senderName.split(' ')[0]}! I've logged your request. Our support team is revieweing it. If you're experiencing a technical issue, please make sure your internet connection is stable. How else can I assist you in the meantime?`,
        timestamp: Date.now() + 1000,
      });
    }

    return messageId;
  },
});

// ── Admin / Support Desk Endpoints ─────────────────────────────────────────

/**
 * Get a list of all active chat channels (grouped by user with last message details)
 */
export const getActiveChats = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query('supportMessages').collect();
    
    // Group messages by userId
    const groups: { [key: string]: any[] } = {};
    for (const msg of messages) {
      if (!groups[msg.userId]) {
        groups[msg.userId] = [];
      }
      groups[msg.userId].push(msg);
    }

    const chatList = [];
    for (const [userId, msgs] of Object.entries(groups)) {
      // Sort messages to get the latest one
      msgs.sort((a, b) => b.timestamp - a.timestamp);
      const latestMsg = msgs[0];
      
      // Fetch user details
      const user = await ctx.db
        .query('users')
        .withIndex('by_uid', (q) => q.eq('uid', userId))
        .unique();

      chatList.push({
        userId,
        userName: user?.displayName || latestMsg.senderName || 'Anonymous Student',
        userEmail: user?.email || '',
        userPlan: user?.plan || 'free',
        lastMessage: latestMsg.text,
        lastMessageSender: latestMsg.sender,
        lastMessageTimestamp: latestMsg.timestamp,
        unreadCount: msgs.filter(m => m.sender === 'student').length, // Simple placeholder
      });
    }

    // Sort chat channels by latest message timestamp
    return chatList.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  },
});

/**
 * Send a support message from an Admin
 */
export const sendAdminMessage = mutation({
  args: {
    userId: v.string(),
    adminName: v.string(),
    text: v.string(),
    attachmentUrl: v.optional(v.string()),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('supportMessages', {
      userId: args.userId,
      sender: 'admin',
      senderName: args.adminName,
      text: args.text,
      attachmentUrl: args.attachmentUrl,
      attachmentName: args.attachmentName,
      timestamp: Date.now(),
    });
  },
});

/**
 * Clean up chat history for a user
 */
export const clearChatHistory = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('supportMessages')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return { success: true };
  },
});
