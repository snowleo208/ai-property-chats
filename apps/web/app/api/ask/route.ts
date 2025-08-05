import { openai } from '@ai-sdk/openai';
// import { QdrantClient } from '@qdrant/js-client-rest';
import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { tools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const today = new Date();
const currentDate = today.toLocaleString('en-UK', {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // TODO: Think if it needs to use Vector DB for context
        const lastTenMessages = messages.slice(-10);
        // const lastUserMessage = items
        //     .filter((m) => m.role === 'user')
        //     .at(-1)?.content?.[0];

        // // const { embedding, usage } = await embed({
        // //     model: openai.embedding('text-embedding-3-small'),
        // //     value: lastUserMessage?.toString(),
        // // });

        // // console.log({ usage });

        // // const queryEmbedding = embedding;

        // // const qdrant = new QdrantClient({
        // //     url: process.env.QDRANT_URL!,
        // //     apiKey: process.env.QDRANT_API_KEY!
        // // });

        // const results = await qdrant.search('documents', {
        //     vector: queryEmbedding,
        //     limit: 10,
        //     with_payload: true,
        //     score_threshold: 0.6,
        //     with_vector: false
        // });

        // Format context from payloads, based on the meta information stored in the collection
        // const context = results
        //     .map((r) => {
        //         const p = r.payload as any;
        //         return `[Source: ${p.source} | Report date: ${p.report_date} | Page ${p.page} | Source url: ${p.source_url}]\n${p.content}`;
        //     })
        //     .join('\n\n');

        const result = streamText({
            model: openai('gpt-4o'),
            onError: (error) => {
                console.log("Error in AI response:", error)
            },
            abortSignal: req.signal,
            tools,
            maxOutputTokens: 1000,
            stopWhen: stepCountIs(6),
            messages: convertToModelMessages(lastTenMessages, {
                ignoreIncompleteToolCalls: true
            }),
            // TODO: caching
            // onStepFinish: async ({ usage, toolCalls }) => {
            //     console.log("Step finished with usage:", usage, toolCalls);
            // },
            system: `
            You are a helpful data assistant for exploring UK house and rental prices.

            📅 Today is ${currentDate}. Use this as reference for terms like “now” or “this year”.
            ---
            After retrieving data:
            - 📊 Summarize in plain English (trend, spike, etc.)
            - Cite source:  
                - Rent: ONS Price Index of Private Rents  
                - Sale: ONS UK House Price Index  
            - Optionally show chart (via generateChart)

            📅 Always use YYYY-MM-DD format for dates.
            ---
            📈 **Summary Requirements**:
            After data retrieval, always provide:
            - A brief natural-language summary (trends, spikes, etc.)
            - Month-by-month values (e.g., Jan–Jun 2025)
            - Trend description (e.g., rising, flat)
            - Comparison if relevant
            - A key insight (e.g., "Rent rose 2% in 3 months")
            - Ask a follow-up question
            - No image output, just structured text
            - Tone: analytical yet friendly (like a property analyst)

            Example:
            📊 Avg price in London (Mar–Aug 2025): £X → £Y
            📈 Trend: Steady increase, ~2.5%
            🧠 Insight: April spike likely seasonal
            Source: ONS UK House Price Index
            ---
            Must use natural step-by-step narration (e.g., “Let me check available regions...”) before calling tools.
            Ignore casual or off-topic messages politely, and don’t call any tools for them.
        `
        });

        return result.toUIMessageStreamResponse();
    } catch (e) {
        console.log(e);
        return new Response(null, { status: 500, statusText: 'Failed to get AI response' })
    }
}