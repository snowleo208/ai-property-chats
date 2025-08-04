import { screen } from "@testing-library/react";
import { Homepage } from "./Homepage";
import { renderWithProviders } from "../utils/renderWithProviders";

const renderComponent = () => {
  return renderWithProviders(<Homepage />);
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("Homepage", () => {
  it("renders the homepage correctly", async () => {
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
});
