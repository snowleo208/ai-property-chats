import { openai } from '@ai-sdk/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { NextRequest } from 'next/server';
import { streamText, embed, convertToModelMessages, stepCountIs } from 'ai';
import { tools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
            stopWhen: stepCountIs(3),
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

                Before calling tools, you must explain your next steps briefly.
                
                You have access to four tools:

                1. getAvailableRegions – returns the list of valid region names in the database.
                2. getHousePrices – retrieves the average house price for a given array of years, months and regions. The latest data in the database is May 2025.
                3. generateChart – creates a visual chart from the returned house price data.

                Rules:
                - If the user refers to “UK” or “United Kingdom”, treat the region as "United Kingdom".
                - If the user asks about a region, but does not provide an exact valid region name, first call getAvailableRegions, find the closest matching region, and then call getHousePrices with that name.
                - Do not skip calling getHousePrices if the user asks for prices, trends, comparisons, or data over time — even if a region is already known.
                - After calling getHousePrices, **you must continue with a short natural-language explanation** by calling getTrendData. Do not stop the response after getHousePrices.
                - Use generateChart only after retrieving data with getHousePrices if a visual is needed.

                Also cite the source for each data point using the following format:
                [Private rent and house prices, UK: Mar 2024, Page X](source_url)

                When calling the generateChart tool, use the following format:

                - title: A short title for the chart (e.g., "Average House Prices 2024")
                - type: Either "line" or "bar", based on what best suits the data
                - xAxis: A list of string labels (e.g., months, regions). Format dates for xAxis as plain strings like Jan 2025
                - series: An array of one or more data series objects:
                - type: Same as the chart type ("bar" or "line")
                - name: The label for this series (e.g., "London")
                - data: A list of numbers matching the xAxis order

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