import * as z from "zod";
// validation schema
export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required."
  }),
});