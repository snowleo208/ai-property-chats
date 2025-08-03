import { tool as createTool } from 'ai';
// import { openai } from '@ai-sdk/openai';
import { neon } from '@neondatabase/serverless';
// import { QdrantClient } from '@qdrant/js-client-rest';
import { z } from "zod/v4";

export const getHousePrices = createTool({
    description: 'Get the house price in a given series of years and regions in string.',
    inputSchema: z.object({
        year: z.array(z.string()),
        month: z.array(z.number()),
        region: z.array(z.string()),
    }),
    execute: async ({ year, month, region }) => {
        console.log("getHousePrices tool invoked with:", { year, month, region });
        const sql = neon(process.env.DATABASE_URL ?? '');
        const yearOffset = 0;
        const monthOffset = year.length;
        const regionOffset = year.length + month.length;

        const yearParams = year.map((_, i) => `$${yearOffset + i + 1}`).join(',');
        const monthParams = month.map((_, i) => `$${monthOffset + i + 1}`).join(',');
        const regionParams = region.map((_, i) => `$${regionOffset + i + 1}`).join(',');


        // Note: DATE_TRUNC here due to ignore timezone issues, e.g. from 2025-05-01 00:00:00 to 2025-05-01 01:00:00 in BST time
        const query = `
        SELECT DATE_TRUNC('month', date) AS month, average_price AS avg_price, region_name
        FROM house_prices
        WHERE EXTRACT(YEAR FROM date) IN (${yearParams})
        AND EXTRACT(MONTH FROM date) IN (${monthParams})
        AND region_name IN (${regionParams})
        ORDER BY month ASC, region_name;
        `;

        const result = await sql.query(query, [...year, ...month, ...region]);

        // console.log("getHousePrices result:", { result });
        return { result };
    }
});

// export const getTrendData = createTool({
//     description: 'Get the house price trend in a House Prices Index.',
//     inputSchema: z.object({
//         questionFromUser: z.string(),
//     }),
//     execute: async ({ questionFromUser }) => {
//         console.log("getTrendData tool invoked with:", { questionFromUser });
//         const { embedding } = await embed({
//             model: openai.embedding('text-embedding-3-small'),
//             value: questionFromUser?.toString(),
//         });

//         const queryEmbedding = embedding;

//         const qdrant = new QdrantClient({
//             url: process.env.QDRANT_URL!,
//             apiKey: process.env.QDRANT_API_KEY!
//         });

//         const results = await qdrant.search('documents', {
//             vector: queryEmbedding,
//             limit: 15,
//             with_payload: true
//         });

//         // Format context from payloads, based on the meta information stored in the collection
//         const context = results
//             .map((r) => {
//                 const p = r.payload as any;
//                 return `[Source: ${p.source} | Report date: ${p.report_date} | Page ${p.page} | Source url: ${p.source_url}]\n${p.content}`;
//             })
//             .join('\n\n');

//         // console.log("getHousePrices result:", { result });
//         return { result: context };
//     }
// });

export const getAvailableRegions = createTool({
    description: 'Get the list of valid region names available in the housing price database.',
    inputSchema: z.object({}),
    execute: async () => {
        console.log("getAvailableRegions tool invoked.");
        const sql = neon(process.env.DATABASE_URL ?? '');
        const result = await sql`
            SELECT DISTINCT region_name 
            FROM house_prices 
            ORDER BY region_name;
        `;
        const regionNames = result.map((row) => row.region_name);
        return { region_names: regionNames };
    }
});

export const generateChart = createTool({
    description: "Generate a chart from structured housing data",
    inputSchema: z.object({
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
    execute: async ({ type, title, xAxis, series }) => {
        console.log("Tool invoked with:", { type, title, xAxis, series });
        return {
            "title": { "text": title },
            "tooltip": {
                "trigger": "axis",
            },
            "grid": {
                "left": "3%",
                "right": "4%",
                "bottom": "3%",
                "containLabel": true
            },
            "toolbox": {
                "feature": {
                    "saveAsImage": {}
                }
            },
            "xAxis": { "type": "category", "data": xAxis },
            "yAxis": { "type": "value" },
            "series": series
        };
    }
});

export const tools = {
    getAvailableRegions,
    getHousePrices,
    generateChart,
};