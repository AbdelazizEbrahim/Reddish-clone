import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  displayName: z.string().min(1, "Display name is required").max(50, "Display name must be less than 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(3, "Community name must be at least 3 characters")
    .max(21, "Community name must be less than 21 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Community name can only contain letters, numbers, and underscores"),
  displayName: z.string().min(1, "Display name is required").max(50, "Display name must be less than 50 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
})

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title must be less than 300 characters"),
  content: z.string().max(10000, "Content must be less than 10000 characters").optional(),
  image: z.string().url().optional(),
  communityId: z.string().min(1, "Community is required"),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(10000, "Comment must be less than 10000 characters"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
})

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name must be less than 50 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url().optional(),
})
