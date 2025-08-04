"use client";
import { Box, Flex, IconButton, TextArea, Tooltip } from "@radix-ui/themes";

export type PromptTextAreaProps = {
  inputValue: string;
  isLoading: boolean;
  onStop: (e: React.FormEvent<HTMLButtonElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement | HTMLTextAreaElement>) => void;
};

export const PromptTextArea = ({
  inputValue,
  isLoading,
  onStop,
  onInputChange,
  onSubmit,
}: PromptTextAreaProps) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line on Shift + Enter
      return;
    }

    e.preventDefault();
    onSubmit(e);
  };


  return (
    <>
      <form onSubmit={onSubmit}>
        <Flex width="100%" gap="2" justify="center">
          <Box maxWidth="70%" flexGrow="1">
            <TextArea variant="surface" radius="full" placeholder="Ask a question about the UK housing market" onChange={onInputChange} value={inputValue} onKeyDown={handleKeyDown} />
          </Box>

          {isLoading ? (
            <Tooltip content="Stop">
              <IconButton onClick={onStop} radius="full" aria-label="Stop" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5" />
                </svg>
              </IconButton>
            </Tooltip>

          ) : (
            <Tooltip content={inputValue === '' ? "Message is empty" : "Send message"}>
              <IconButton disabled={inputValue === ''} radius="full" aria-label="Send message" type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                </svg>
              </IconButton>
            </Tooltip>
          )}

        </Flex>
      </form>
    </>
  );
};
