import { Box, Container, Heading } from "@radix-ui/themes";
import { PropertyChat } from "../components/PropertyChat/PropertyChat.client";

export const Homepage = () => {
  return (
    <Container size="4" p="2">
      <Box px="4">
        <Heading as="h1" mb="2">Just ask House Prices</Heading>
      </Box>
      <PropertyChat />
    </Container>
  );
};
