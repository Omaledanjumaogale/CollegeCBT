import { z } from 'zod';

// ─── API Schemas ────────────────────────────────────────────────────────────

export const generateQuestionSchema = z.object({
  course: z.string().min(2, "Course name is required"),
  level: z.string().optional(),
  institutionType: z.enum(['University', 'Polytechnic', 'College of Education', 'Professional']),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
  type: z.enum(['MCQ', 'Theory']).default('MCQ'),
  uid: z.string().optional() // Firebase UID for plan verification
});

export const gradeExamSchema = z.object({
  course: z.string().min(2, "Course name is required"),
  level: z.string().optional(),
  institutionType: z.string().optional(),
  uid: z.string().optional(),
  answers: z.array(z.object({
    question: z.string().min(1),
    keyPoints: z.array(z.object({
      point: z.string(),
      marks: z.number()
    })),
    modelAnswer: z.string().min(1),
    userAnswer: z.string(),
    maxMarks: z.number(),
    topic: z.string().optional()
  })).min(1, "At least one answer is required")
});

export type GradeExamRequest = z.infer<typeof gradeExamSchema>;

// ─── Auth Schemas ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
  displayName: z.string().min(2, "Display name is required"),
  // Profile specific
  nin: z.string().length(11, "NIN must be 11 digits").optional().or(z.literal('')),
  phone: z.string().min(10, "Valid phone number required").optional().or(z.literal('')),
  institutionName: z.string().min(2).optional(),
  department: z.string().min(1).optional(),
  level: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type SignupRequest = z.infer<typeof signupSchema>;

// ─── Profile Schemas ──────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).optional(),
  phone: z.string().min(10).optional().or(z.literal('')),
  whatsapp: z.string().min(10).optional().or(z.literal('')),
  nin: z.string().length(11).optional().or(z.literal('')),
  institutionName: z.string().min(2).optional(),
  faculty: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  level: z.string().optional(),
  stateOfResidence: z.string().optional(),
  lga: z.string().optional(),
  address: z.string().optional()
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
