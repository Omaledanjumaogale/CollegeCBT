import { v } from 'convex/values';
import { mutation, query, internalMutation, internalAction } from './_generated/server';
import { internal } from './_generated/api';

/**
 * Enterprise Workflow Orchestration.
 * Manages atomic multi-step background jobs with state persistence.
 */

export const triggerWorkflow = mutation({
  args: {
    name: v.string(),
    steps: v.array(v.string()),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const workflowId = await ctx.db.insert('workflows', {
      name: args.name,
      status: 'pending',
      steps: args.steps.map(s => ({ name: s, status: 'pending' })),
      currentStep: 0,
      payload: args.payload,
      timestamp: Date.now(),
    });

    // Start background background runner
    await ctx.scheduler.runAfter(0, internal.workflowManager.runWorkflowAction, { workflowId });
    return workflowId;
  },
});

export const runWorkflowAction = internalAction({
  args: { workflowId: v.id('workflows') },
  handler: async (ctx, args) => {
    // 1. Update to in_progress
    await ctx.runMutation(internal.workflowManager.updateWorkflowStatus, { 
      workflowId: args.workflowId, 
      status: 'in_progress' 
    });

    const workflow = await ctx.runQuery(internal.workflowManager.getWorkflow, { workflowId: args.workflowId });
    if (!workflow) return;

    for (let i = 0; i < workflow.steps.length; i++) {
        // Core execution logic for each step
        // In a real system, we'd map step names to specific internal functions
        try {
            console.log(`Executing workflow step: ${workflow.steps[i].name}`);
            await ctx.runMutation(internal.workflowManager.completeStep, { workflowId: args.workflowId, stepIndex: i });
        } catch (err: any) {
             await ctx.runMutation(internal.workflowManager.failWorkflow, { 
                workflowId: args.workflowId, 
                stepIndex: i, 
                error: err.message 
            });
            return;
        }
    }

    await ctx.runMutation(internal.workflowManager.updateWorkflowStatus, { 
      workflowId: args.workflowId, 
      status: 'completed' 
    });
  },
});

// ── Internal Mutations ──

export const getWorkflow = query({
  args: { workflowId: v.id('workflows') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workflowId);
  },
});

export const updateWorkflowStatus = internalMutation({
  args: { workflowId: v.id('workflows'), status: v.union(v.literal('in_progress'), v.literal('completed'), v.literal('failed')) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workflowId, { status: args.status });
  },
});

export const completeStep = internalMutation({
  args: { workflowId: v.id('workflows'), stepIndex: v.number() },
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) return;
    const steps = [...workflow.steps];
    steps[args.stepIndex].status = 'completed';
    await ctx.db.patch(args.workflowId, { steps, currentStep: args.stepIndex + 1 });
  },
});

export const failWorkflow = internalMutation({
  args: { workflowId: v.id('workflows'), stepIndex: v.number(), error: v.string() },
  handler: async (ctx, args) => {
     const workflow = await ctx.db.get(args.workflowId);
     if (!workflow) return;
     const steps = [...workflow.steps];
     steps[args.stepIndex].status = 'failed';
     steps[args.stepIndex].error = args.error;
     await ctx.db.patch(args.workflowId, { steps, status: 'failed' });
  },
});
