import { openai } from '@ai-sdk/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { NextRequest } from 'next/server';
import { streamText, embed } from 'ai';
import { tools } from './tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!
});

export async function POST(req: NextRequest) {
    const { messages } = await req.json();

    // TODO: do type validation on incoming messages
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').at(-1)?.content;

    if (!lastUserMessage) {
        throw new Error('No user message to embed');
    }

    const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: lastUserMessage,
    });

    const queryEmbedding = embedding;

    const results = await qdrant.search('documents', {
        vector: queryEmbedding,
        limit: 20,
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
        prompt: `
            Based on the following question, please select the most relevant segments from the provided text, and extract the corresponding data (e.g., price trends, average house prices, sales volume, etc.) in the following format:

            A brief summary

            Include the source page number and source link for each data point

            Provided segments:
            ${context}

            Question:
            ${lastUserMessage}
        `,
        system: `
                You are a real estate data analysis assistant.

                You will be provided with user questions and supporting text segments that contain housing market data (e.g., prices, trends, volume). Your goal is to:

                1. Answer the user's question based on the data.
                2. If the user asks for a chart or graph, use the generateChart tool.

                Only use the tool if the user asks for a visual representation.

                If you use the generateChart tool to create a chart, you must also include a short explanation in natural language before or after the chart, describing the key insights (e.g., trends, comparisons).

                For example:

                "The chart below shows a steady increase in average house prices from January to March 2025. London consistently had higher prices compared to Manchester."

                Then call the generateChart tool. When calling the generateChart tool, use the following format:

                - title: A short title for the chart (e.g., "Average House Prices 2024")
                - type: Either "line" or "bar", based on what best suits the data
                - xAxis: A list of string labels (e.g., months, regions)
                - series: An array of one or more data series objects:
                - type: Same as the chart type ("bar" or "line")
                - name: The label for this series (e.g., "London")
                - data: A list of numbers matching the xAxis order

                Do not use any other format (like yAxis, dataset, or seriesName). Only use the fields defined above.

                Also cite the source for each data point using the following format:
                [Page X, Report Title](source_url)

                If the user asks something unrelated to real estate or data (e.g., greetings or jokes), respond politely and briefly, and do not generate or reference any chart or data.
        `
    });

    return result.toDataStreamResponse();
}
