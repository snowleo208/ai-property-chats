"use client";

import { Box, Button, Flex, TextArea } from "@radix-ui/themes";


export type PromptTextAreaProps = {
  isLoading: boolean;
  onStop: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const PromptTextArea = ({
  isLoading,
  onStop,
  onInputChange,
  onSubmit,
}: PromptTextAreaProps) => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Flex gap="2">
          <Box maxWidth="90%" flexGrow="1">
            <TextArea placeholder="Ask a question about the UK housing market" onChange={onInputChange} />
          </Box>

          {isLoading ? (<Button onClick={onStop} disabled={!isLoading}>Stop</Button>) : (<Button type="submit" disabled={isLoading}>Ask</Button>)}

        </Flex>
      </form>
    </>
  );
};
