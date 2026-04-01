import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price cannot be negative"),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
  minStockThreshold: z.number().int().min(0, "Threshold cannot be negative"),
  status: z.enum(["Active", "Out of Stock"]),
  categoryId: z.string().min(1, "Category is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ProductValues = z.infer<typeof productSchema>;
