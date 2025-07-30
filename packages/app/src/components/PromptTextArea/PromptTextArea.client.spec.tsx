import { screen } from "@testing-library/react";
import { PromptTextArea, PromptTextAreaProps } from "./PromptTextArea.client";
import { renderWithProviders } from "../../utils/renderWithProviders";

global.HTMLElement.prototype.scrollIntoView = jest.fn();
global.HTMLElement.prototype.releasePointerCapture = jest.fn();
global.HTMLElement.prototype.hasPointerCapture = jest.fn();

const defaultProps: PromptTextAreaProps = {
    isLoading: false,
    onStop: jest.fn(),
    onSubmit: jest.fn(),
    onInputChange: jest.fn()
}

const renderComponent = (props: PromptTextAreaProps = defaultProps) => {
    return renderWithProviders(
        <PromptTextArea
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

        const genreSelect = screen.getByRole("combobox", { name: 'Select genre' });
        expect(genreSelect).toBeInTheDocument();

        const lengthSelect = screen.getByRole("combobox", { name: 'Select length' });
        expect(lengthSelect).toBeInTheDocument();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeInTheDocument();
        expect(askButton).not.toBeDisabled();

        const stopButton = screen.queryByRole("button", { name: "Stop" });
        expect(stopButton).toBeInTheDocument();
        expect(stopButton).toBeDisabled();
    });

    it("calls onSubmit when form is submitted", async () => {
        const { user } = renderComponent();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeInTheDocument();
        await user.click(askButton);

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it("calls onStop when Stop is clicked", async () => {
        const mockStop = jest.fn();
        const { user } = renderComponent({
            ...defaultProps,
            isLoading: true,
            onStop: mockStop,
        });

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeDisabled();

        const stopButton = screen.getByRole("button", { name: "Stop" });
        expect(stopButton).toBeInTheDocument();

        await user.click(stopButton);
        expect(mockStop).toHaveBeenCalled();
    });
});