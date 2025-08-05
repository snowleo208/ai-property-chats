import { tool as createTool } from 'ai';
import { neon } from '@neondatabase/serverless';
import { z } from "zod/v4";

// House Prices data from: https://www.gov.uk/government/statistical-data-sets/uk-house-price-index-data-downloads-may-2025
// Rental data from: https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics
// Price Paid Data 2024-2025 https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads

export const findAffordableRegions = createTool({
    description: 'Get region where the average house price is below a given budget during a specified date range between 2 dates (YYYY-MM-DD).If no specified date, it supposed to be the current year. For sale only.',
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

export const getHousePrices = createTool({
    description: 'Get house prices for regions between 2 dates (YYYY-MM-DD). Must call matchRegionForSale to get available regions first. Returns average price per month.',
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

export const getRentPrices = createTool({
    description: 'Get rental prices for regions between 2 dates (YYYY-MM-DD). Must call getAvailableRegionsForRental to get available regions first.',
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

export const matchRegionForSale = createTool({
    description: 'Find closest matching sales region name. Choose the most relevant region.',
    inputSchema: z.object({
        areaName: z.string(),
    }),
    execute: async ({ areaName }) => {
        console.log("matchRegionForSale tool invoked.", areaName);
        const sql = neon(process.env.DATABASE_URL ?? '');
        const result = await sql`
            SELECT DISTINCT region_name 
            FROM house_prices
            WHERE SIMILARITY(region_name, ${areaName}) > 0.5
            LIMIT 10;
        `;
        const matchedRegions = result.map((row) => row.region_name);
        return { matchedRegions };
    }
});

export const matchRegionForRental = createTool({
    description: 'Find closest matching rental region name. Choose the most relevant region.',
    inputSchema: z.object({
        areaName: z.string(),
    }),
    execute: async ({ areaName }) => {
        console.log("getAvailableRegionsForRental tool invoked.", areaName);
        const sql = neon(process.env.DATABASE_URL ?? '');
        const result = await sql`
            SELECT DISTINCT area_name
            FROM rental_prices
            WHERE SIMILARITY(area_name, ${areaName}) > 0.5
            LIMIT 10;
        `;
        const matchedRegions = result.map((row) => row.area_name);
        return { matchedRegions };
    }
});

export const generateChart = createTool({
    description: 'Return basic chart data (title, labels, values) to visualize a trend. Use for simple line or bar charts.',
    inputSchema: z.object({
        title: z.string(),
        chartType: z.union([z.literal('line'), z.literal('bar')]),
        labels: z.array(z.string()),
        values: z.array(z.number())
    }),
    execute: async ({ title, chartType, labels, values }) => {
        console.log("generateChart called with:", { title, chartType, labels, values });

        return {
            type: chartType,
            title,
            labels,
            values
        };
    }
});

export const tools = {
    matchRegionForSale,
    matchRegionForRental,
    getHousePrices,
    findAffordableRegions,
    getRentPrices,
    generateChart,
};