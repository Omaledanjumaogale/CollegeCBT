/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as academic from "../academic.js";
import type * as admin from "../admin.js";
import type * as agentWorkflow from "../agentWorkflow.js";
import type * as aiOrchestrator from "../aiOrchestrator.js";
import type * as cache from "../cache.js";
import type * as crawler from "../crawler.js";
import type * as crons from "../crons.js";
import type * as gradeReports from "../gradeReports.js";
import type * as interactionSessions from "../interactionSessions.js";
import type * as mail from "../mail.js";
import type * as rateLimit from "../rateLimit.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as triggers from "../triggers.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";
import type * as workflowManager from "../workflowManager.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  academic: typeof academic;
  admin: typeof admin;
  agentWorkflow: typeof agentWorkflow;
  aiOrchestrator: typeof aiOrchestrator;
  cache: typeof cache;
  crawler: typeof crawler;
  crons: typeof crons;
  gradeReports: typeof gradeReports;
  interactionSessions: typeof interactionSessions;
  mail: typeof mail;
  rateLimit: typeof rateLimit;
  seed: typeof seed;
  sessions: typeof sessions;
  triggers: typeof triggers;
  users: typeof users;
  validators: typeof validators;
  workflowManager: typeof workflowManager;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
