import { openai } from '@ai-sdk/openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { NextRequest } from 'next/server';
import { streamText, embed } from 'ai';

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
        prompt: `
            Based on the following question, please select the most relevant segments from the provided text, and extract the corresponding data (e.g., price trends, average house prices, sales volume, etc.) in the following format:

            A brief summary

            If applicable, wrap chart data inside <echarts-option> tags so it can be parsed by the frontend

            Include the source page number and source link for each data point

            Provided segments:
            ${context}

            Question:
            ${lastUserMessage}
        `,
        system: `
                You are a real estate data analysis assistant. Please answer the user's question based on the provided text segments, and organize the data into a JSON format suitable for frontend chart rendering.
                
                If the user says something unrelated (e.g., greetings, jokes, or personal questions), respond briefly and politely, and do not reference real estate data.

                If the user requests a visual chart, generate a JSON structure compatible with Apache ECharts, and wrap it inside <echarts-option>...</echarts-option> tags.

                The ECharts JSON should include the following fields: title, xAxis, yAxis, series, and tooltip.
                The xAxis should represent categories (e.g., months), while the yAxis should represent corresponding values (e.g., housing prices or growth rates).
                The series should be either a line chart or a bar chart.

                Only generate a chart wrapped in <echarts-option>...</echarts-option> if the user explicitly asks for a visual, chart, or graph. Otherwise, do not include any chart.

                Please determine the appropriate chart type (e.g., line, bar) automatically based on the data and configure it correctly.

                Additionally, provide a brief explanation and include the page number and a markdown-formatted source link for each data point, for example:
                [House Price Index June 2025](https://assets.ctfassets.net/02vwvgr6spsr/1Tdp6H6MvjpVtbzoo2erEt/f1150fdc8d355e35166f8e88a9498d12/UK_House_Price_Index_June25_final_ZP.pdf)
        `
    });

    return result.toDataStreamResponse();
}
