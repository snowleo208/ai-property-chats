import { screen, waitFor } from "@testing-library/react";
import { simulateReadableStream } from "ai";
import { PropertyChat } from "./PropertyChat.client";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { renderWithProviders } from "../../utils/renderWithProviders";

global.HTMLElement.prototype.scrollIntoView = jest.fn();
global.HTMLElement.prototype.releasePointerCapture = jest.fn();
global.HTMLElement.prototype.hasPointerCapture = jest.fn();

const server = setupServer(
    // TODO: fix this for chats
    http.post('/api/ask', async ({ request }) => {
        const data = await request.clone().json();

        const prompt = JSON.parse(data.prompt);

        const genreText = prompt.genre ? `${String(prompt.genre).toLowerCase()} movie` : 'movie';
        const hourText = prompt.hour ?? 'no length specified';

        // https://ai-sdk.dev/docs/ai-sdk-core/testing#simulate-data-stream-protocol-responses
        const stream = simulateReadableStream({
            initialDelayInMs: 100,
            chunkDelayInMs: 5,
            chunks: [
                `0:"This"\n`,
                `0:" is a "\n`,
                `0:"${hourText} example ${genreText}. "\n`,
                `e:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50},"isContinued":false}\n`,
                `d:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50}}\n`,
            ],
        }).pipeThrough(new TextEncoderStream());

        return new HttpResponse(stream, {
            status: 200,
            headers: {
                'X-Vercel-AI-Data-Stream': 'v1',
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }),
);

beforeAll(() => server.listen());

afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
});

afterAll(() => server.close());

const renderComponent = () => {
    return renderWithProviders(
        <PropertyChat />
    );
};

describe("PropertyChat", () => {
    it("renders correctly", () => {
        renderComponent();
        expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
    });

    it("displays loading state when submitting", async () => {
        const { user } = renderComponent();
        const askButton = screen.getByRole("button", { name: "Ask" });
        await user.click(askButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();
    });

    it("stops when user clicked 'Stop' button", async () => {
        const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

        const { user } = renderComponent();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();

        await user.click(askButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();

        expect(abortSpy).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        const stopButton = screen.getByRole("button", { name: "Stop" });
        await user.click(stopButton);

        // Note: This test confirms that the Stop button triggers the SDK's abort logic.
        // Due to MSW limitations, the mock fetch stream cannot respond to AbortSignal coming from Vercel ai-sdk in the middle of the test.
        // Unfortunately, this test does NOT verify that streaming is halted mid-request, it only asserts that .abort() was called.
        expect(abortSpy).toHaveBeenCalledTimes(1);
    });

});