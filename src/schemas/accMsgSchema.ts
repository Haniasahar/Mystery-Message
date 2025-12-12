import z from "zod";

export const accMsgSchema = z.object({
  accMsg: z.boolean(),
});
