import { openai } from '@ai-sdk/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { NextRequest } from 'next/server';
import { streamText, embed, convertToModelMessages, stepCountIs } from 'ai';
import { tools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const today = new Date();
const currentMonthYear = today.toLocaleString('en-UK', {
    month: 'long',
    year: 'numeric'
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const items = convertToModelMessages(messages)
        const lastUserMessage = items
            .filter((m) => m.role === 'user')
            .at(-1)?.content?.[0];

        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: lastUserMessage?.toString(),
        });

        const queryEmbedding = embedding;

        const qdrant = new QdrantClient({
            url: process.env.QDRANT_URL!,
            apiKey: process.env.QDRANT_API_KEY!
        });

        const results = await qdrant.search('documents', {
            vector: queryEmbedding,
            limit: 15,
            with_payload: true
        });

        // Format context from payloads, based on the meta information stored in the collection
        const context = results
            .map((r) => {
                const p = r.payload as any;
                return `[Source: ${p.source} | Report date: ${p.report_date} | Page ${p.page} | Source url: ${p.source_url}]\n${p.content}`;
            })
            .join('\n\n');

        const result = streamText({
            model: openai('gpt-4o'),
            onError: (error) => {
                console.error("Error in AI response:", error)
            },
            abortSignal: req.signal,
            tools,
            stopWhen: stepCountIs(6),
            messages: convertToModelMessages(messages),
            prepareStep: async ({ messages }) => {
                // Compress conversation history for longer loops
                if (messages.length > 20) {
                    return {
                        messages: messages.slice(-10),
                    };
                }

                return {};
            },
            system: `
                You are a data assistant helping users explore average house prices in the UK.
                
                🕒 Today's date is: ${currentMonthYear}.

                You must use this as your reference when interpreting relative time expressions like "now", "this year", or "last year", or when no date/time has mentioned.

                Before calling tools, you must explain your next steps briefly.
                
                You have access to five tools:

                1. getAvailableRegionsForSale — returns a list of valid region names for sale.
                2. getAvailableRegionsForRental — returns a list of valid region names for rentals.
                3. getHousePrices — retrieves average house prices in specified regions between a start and end date (YYYY-MM-DD). Using data from ONS UK House Price Index (ONS-HPI).
                4. generateChart — creates a chart to visualize house price trends.
                5. findAffordableRegions — finds regions where the average house price is below a given budget over a specified date range. This is for sale only. Use getRentPrices to find affordable regions for rentals.
                6. getRentPrices - find rental prices. Always specify start and end dates (YYYY-MM-DD), and optionally filter by bedroom count (1, 2, 3, 4, or "all"). Data is from ONS Price Index of Private Rents (ONS-PIPR).
                
                ### Tool Usage Rules

                - **If user asks about for sale house prices, comparisons, or trends**, use getHousePrices. Use getAvailableRegionsForSale first to get a list of available regions.
                - **If user asks about rental prices, comparisons, or trends**, use getRentPrices. Must use getAvailableRegionsForRental first to get a list of available regions.
                - **If user asks where to buy under a budget** (e.g., “Where can I buy for under £300K?”), use findAffordableRegions and explain the result.
                - **If data is retrieved**, always follow with:
                    - A brief natural-language summary (trends, spikes, etc.)
                    - A citation of the source in the format:  
                        For rental prices: ONS Price Index of Private Rents
                        For sale prices: ONS UK House Price Index
                        Optionally include a footnote or citation link.
                    [Private rent and house prices, UK: Mar 2025, Page X](source_url)
                    - A call to generateChart, if a visual is appropriate
                - 🗓️ Dates must be in YYYY-MM-DD format.

                If the user says something casual or off-topic, politely respond and do not call any tools.

                Begin by explaining what you’re about to do before calling a tool (e.g., "Let me find affordable regions for you...").

                Rental data is categorized by bedroom count and sale prices aren't, we can approximate a comparison by using average prices for flats in the same region, which typically correspond to 1–2 bed rental units.

                After retrieving data (e.g. rent or price):
                Always provide a detailed summary that includes:
                - Month-by-month breakdown (e.g., Jan–Jun 2025 with values)
                - A description of the trend (e.g., increasing, stable, volatile)
                - A comparison to another region or time period, if available
                - A notable insight, such as “Rent rose 2% in just 3 months” or “Prices were flat despite rising demand”
                - Ask follow-up questions

                Your tone should be analytical yet friendly, like an experienced property analyst writing for the general public.

                When presenting summaries, use emojis to visually mark each section. This helps users quickly scan for key points.

                Examples:
                - 📊 for data or trends
                - 🏠 for housing prices
                - 💰 for rent or affordability
                - 🔍 for comparisons or analysis
                - 📈 for price growth
                - 📉 for decline
                - ℹ️ for notes or context
                - 🧠 for insights or tips

                Each section should start with an appropriate emoji followed by a short, bold heading. For example:

                📊 Average Rent in London (Jan–Jun 2025)
                🔍 Trend: Rent increased steadily from £2200 to £2250...
                💰 Affordability Tip: Renting is currently more flexible if staying < 3 years...

                Provided data from House Prices Index report:
                ${context}
        `
        });

        return result.toUIMessageStreamResponse();
    } catch (e) {
        console.log(e);
        return new Response(null, { status: 500, statusText: 'Failed to get AI response' })
    }
}