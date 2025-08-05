import z from "zod/v4";

// TODO: possibly move to a separate lib to share with backend
export const chartSchema = z.strictObject({
    title: z.string(),
    type: z.union([z.literal("bar"), z.literal("line")]),
    xAxis: z.array(z.string()),
    series: z.array(
        z.object({
            type: z.union([z.literal("bar"), z.literal("line")]),
            name: z.string(),
            data: z.array(z.union([z.number(), z.null()]))
        })
    )
})

export type Chart = z.infer<typeof chartSchema>;