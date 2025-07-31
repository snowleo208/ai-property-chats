import { Container } from "@radix-ui/themes";
import { PropertyChat } from "../components/PropertyChat/PropertyChat.client";

export const Homepage = () => {
  return (
    <Container size="3" p="2">
      <PropertyChat />
    </Container>
  );
};
