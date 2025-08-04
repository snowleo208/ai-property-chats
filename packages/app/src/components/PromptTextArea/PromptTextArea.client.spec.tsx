import { screen, waitFor } from "@testing-library/react";
import { PromptTextArea, PromptTextAreaProps } from "./PromptTextArea.client";
import { renderWithProviders } from "../../utils/renderWithProviders";

const defaultProps: PromptTextAreaProps = {
    inputValue: '',
    isLoading: false,
    onStop: jest.fn(),
    onSubmit: jest.fn(),
    onInputChange: jest.fn()
}

const renderComponent = (props: PromptTextAreaProps = defaultProps) => {
    return renderWithProviders(
        <PromptTextArea
            inputValue={props.inputValue}
            isLoading={props.isLoading}
            onStop={props.onStop}
            onSubmit={props.onSubmit}
            onInputChange={props.onInputChange}
        />
    );
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("PromptTextArea", () => {
    it("renders correctly", () => {
        renderComponent();

        const sendButton = screen.getByRole("button", { name: "Send message" });
        expect(sendButton).toBeInTheDocument();
        expect(sendButton).toBeDisabled();
    });

    it("calls onSubmit when form is submitted", async () => {
        const { user } = renderComponent({
            ...defaultProps,
            inputValue: "Test message",
        });

        const sendButton = screen.getByRole("button", { name: "Send message" });

        await waitFor(() => {
            expect(sendButton).toBeEnabled();
        });
        await user.click(sendButton);

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it("calls onStop when Stop is clicked", async () => {
        const mockStop = jest.fn();
        const { user } = renderComponent({
            ...defaultProps,
            isLoading: true,
            onStop: mockStop,
        });

        const stopButton = screen.getByRole("button", { name: "Stop" });
        expect(stopButton).toBeInTheDocument();

        await user.click(stopButton);
        expect(mockStop).toHaveBeenCalled();
    });
});