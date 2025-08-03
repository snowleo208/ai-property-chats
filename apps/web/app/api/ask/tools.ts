import { tool as createTool } from 'ai';
import { neon } from '@neondatabase/serverless';
import { z } from "zod/v4";

// House Prices data from: https://www.gov.uk/government/statistical-data-sets/uk-house-price-index-data-downloads-may-2025
// Rental data from: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics

export const findAffordableRegions = createTool({
    description: 'Find regions where the average house price is below a given budget during a specified date range. Dates must be in YYYY-MM-DD format, e.g. 2025-01-01. If no specified date, it supposed to be the current year. This is for sale prices only. ',
    inputSchema: z.object({
        startDate: z.string(),
        endDate: z.string(),
        maxPrice: z.number(),
    }),
    execute: async ({ startDate, endDate, maxPrice }) => {
        const sql = neon(process.env.DATABASE_URL ?? '');

        const result = await sql`
      SELECT region_name,
             ROUND(AVG(average_price)) AS avg_price
      FROM house_prices
      WHERE date BETWEEN ${startDate} AND ${endDate}
      GROUP BY region_name
      HAVING AVG(average_price) < ${maxPrice}
      ORDER BY avg_price ASC;
    `;

        return { result };
    }
});

export const getAvailableRegionsForRental = createTool({
    description: 'Get the list of valid region names available in the rental index database.',
    inputSchema: z.object({}),
    execute: async () => {
        console.log("getAvailableRegionsForRental tool invoked.");
        const sql = neon(process.env.DATABASE_URL ?? '');
        const result = await sql`
            SELECT DISTINCT area_name 
            FROM rental_prices 
            ORDER BY area_name;
        `;
        const regionNames = result.map((row) => row.area_name);
        return { region_names: regionNames };
    }
});

export const getRentPrices = createTool({
    description: 'Get average rental prices for a region over a date range. Optionally filter by bedroom count. Dates must be in YYYY-MM-DD format, e.g. 2025-01-01. Must call getAvailableRegionsForRental to get available regions first.',
    inputSchema: z.object({
        startDate: z.string(),
        endDate: z.string(),
        region: z.string(),
        bedroomCount: z.union([
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal('all')
        ]).optional().default('all'),
    }),
    execute: async ({ startDate, endDate, region, bedroomCount }) => {
        const sql = neon(process.env.DATABASE_URL ?? '');
        console.log("getRentPrices tool invoked with:", { startDate, endDate, region, bedroomCount });

        const rentColumn = {
            1: 'rental_price_1bed',
            2: 'rental_price_2bed',
            3: 'rental_price_3bed',
            4: 'rental_price_4plus',
            all: 'rental_price_all',
        }[bedroomCount ?? 'all'];

        const result = await sql`
      SELECT date, ${sql.unsafe(rentColumn)}, area_name AS rent
      FROM rental_prices
      WHERE date BETWEEN ${startDate} AND ${endDate}
        AND area_name = ${region}
      ORDER BY date ASC;
    `;

        return { result };
    }
});


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

export const getAvailableRegionsForSale = createTool({
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
    getAvailableRegionsForSale,
    getHousePrices,
    findAffordableRegions,
    getAvailableRegionsForRental,
    getRentPrices,
    generateChart,
};