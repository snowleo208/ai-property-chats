import { tool as createTool } from 'ai';
import { z } from 'zod';

export const chartTool = createTool({
    description: "Generate a chart from structured housing data",
    parameters: z.object({
        title: z.string(),
        type: z.union([z.literal("bar"), z.literal("line")]),
        legendData: z.array(z.string()),
        xAxis: z.array(z.string()),
        series: z.array(
            z.object({
                type: z.union([z.literal("bar"), z.literal("line")]),
                name: z.string(),
                data: z.array(z.union([z.number(), z.null()]))
            })
        )
    }),
    execute: async ({ type, title, xAxis, series }: any) => {
        console.log("Tool invoked with:", { type, title, xAxis, series });
        return {
            "title": { "text": title },
            "tooltip": {},
            "xAxis": { "type": "category", "data": xAxis },
            "yAxis": { "type": "value" },
            "series": series
        };
    }
});

export const tools = {
    generateChart: chartTool,
};

// import { tool as createTool } from 'ai';
// import { z } from 'zod';

// export const weatherTool = createTool({
//   description: 'Generate a chart from structured housing data',
//   parameters: z.object({
//     location: z.string().describe('The location to get the weather for'),
//   }),
//   execute: async function ({ location }) {
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     return { weather: 'Sunny', temperature: 75, location };
//   },
// });