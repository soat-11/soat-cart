import { z } from "zod";

export const AddItemToCartSchema = z.object({
  sku: z.string().min(1, { message: "SKU é obrigatório" }),
  quantity: z
    .number()
    .int({ message: "A quantidade deve ser um número inteiro" })
    .min(1, { message: "A quantidade deve ser no mínimo 1" }),

  unitPrice: z
    .number()
    .min(0.01, { message: "O preço unitário deve ser maior que zero" }),
});

export type AddItemToCartDto = z.infer<typeof AddItemToCartSchema>;
