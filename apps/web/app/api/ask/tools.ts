import { tool as createTool } from 'ai';
import { neon } from '@neondatabase/serverless';
import { z } from "zod/v4";

export const getHousePrices = createTool({
    description: 'Get the house price between a start date and an end date for one or more regions. Dates must be in YYYY-MM-DD format, e.g. 2025-01-01',
    inputSchema: z.object({
        startDate: z.string(),
        endDate: z.string(),
        region: z.array(z.string()),
    }),
    execute: async ({ startDate, endDate, region }) => {
        console.log("getHousePrices tool invoked with:", { startDate, endDate, region });
        const sql = neon(process.env.DATABASE_URL ?? '');

        const regionPlaceholders = region.map((_, i) => `$${i + 3}`).join(',');

        const query = `
      SELECT DATE_TRUNC('month', date) AS month,
             average_price AS avg_price,
             region_name
      FROM house_prices
      WHERE date BETWEEN $1 AND $2
        AND region_name IN (${regionPlaceholders})
      ORDER BY month ASC, region_name;
    `;

        const result = await sql.query(query, [startDate, endDate, ...region]);

        return { result };
    }
});

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