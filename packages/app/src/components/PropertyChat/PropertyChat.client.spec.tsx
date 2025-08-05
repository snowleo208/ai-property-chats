import { screen, waitFor } from "@testing-library/react";
import { simulateReadableStream } from "ai";
import { PropertyChat } from "./PropertyChat.client";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { renderWithProviders } from "../../utils/renderWithProviders";

global.HTMLElement.prototype.scrollIntoView = jest.fn();

const server = setupServer(
  http.post("/api/ask", async () => {
    // https://ai-sdk.dev/docs/ai-sdk-core/testing#simulate-data-stream-protocol-responses
    const stream = simulateReadableStream({
      initialDelayInMs: 100,
      chunkDelayInMs: 50,
      chunks: [
        `data: {"type":"start","messageId":"msg-123"}\n\n`,
        `data: {"type":"text-start","id":"text-1"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":"This"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" is an"}\n\n`,
        `data: {"type":"text-delta","id":"text-1","delta":" example."}\n\n`,
        `data: {"type":"text-end","id":"text-1"}\n\n`,
        `data: {"type":"finish"}\n\n`,
        `data: [DONE]\n\n`,
      ],
    }).pipeThrough(new TextEncoderStream());

    return new HttpResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  })
);

beforeAll(() => server.listen());

afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

afterAll(() => server.close());

const renderComponent = () => {
  return renderWithProviders(<PropertyChat />);
};

describe("PropertyChat", () => {
  it("renders correctly", () => {
    renderComponent();

    expect(
      screen.getByRole("heading", {
        name: "How can I help you today?",
        level: 1,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Send message" })
    ).toBeInTheDocument();
  });

  it("displays loading state when submitting", async () => {
    const { user } = renderComponent();

    const defaultQuestions = screen.getByRole("button", {
      name: "What’s the average house price in NW3?",
    });
    await user.click(defaultQuestions);

    expect(await screen.findByText("Loading...")).toBeInTheDocument();
  });

  it("shows results from AI", async () => {
    const { user } = renderComponent();

    const defaultQuestions = screen.getByRole("button", {
      name: "What’s the average house price in NW3?",
    });
    await user.click(defaultQuestions);

    expect(await screen.findByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: "What’s the average house price in NW3?",
        })
      ).not.toBeInTheDocument();
    });

    expect(await screen.findByText("This is an example.")).toBeInTheDocument();
  });

  //   TODO: fix it properly for ai sdk v5
  it.skip("stops when user clicked 'Stop' button", async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, "abort");

    const { user } = renderComponent();

    const sendButton = screen.getByRole("button", { name: "Send message" });

    expect(
      screen.getByRole("button", { name: "Send message" })
    ).toBeInTheDocument();

    const defaultQuestions = screen.getByRole("button", {
      name: "What’s the average house price in NW3?",
    });
    await user.click(defaultQuestions);

    expect(await screen.findByText("Loading...")).toBeInTheDocument();

    expect(abortSpy).not.toHaveBeenCalled();

    const stopButton = screen.getByRole("button", { name: "Stop" });
    await user.click(stopButton);

    // Note: This test confirms that the Stop button triggers the SDK's abort logic.
    // Due to MSW limitations, the mock fetch stream cannot respond to AbortSignal coming from Vercel ai-sdk in the middle of the test.
    // Unfortunately, this test does NOT verify that streaming is halted mid-request, it only asserts that .abort() was called.
    expect(abortSpy).toHaveBeenCalledTimes(1);
  });
});
