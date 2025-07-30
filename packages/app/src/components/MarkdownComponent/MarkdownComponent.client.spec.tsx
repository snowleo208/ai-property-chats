import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MarkdownComponent } from "./MarkdownComponent.client";
import { renderWithProviders } from "../../utils/renderWithProviders";

const renderComponent = () => {
    return renderWithProviders(
        <MarkdownComponent content="# Test Markdown Component\nThis is a **bold** text and this is an *italic* text."
        />);
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("MarkdownComponent", () => {
    it("renders correctly", () => {
        renderComponent();

        expect(screen.getByText(/Test Markdown Component/)).toBeInTheDocument();
    });
});