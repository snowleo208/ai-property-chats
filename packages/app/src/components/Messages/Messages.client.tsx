import { Box, Button, Callout, Flex, ScrollArea, Spinner, Strong, VisuallyHidden } from "@radix-ui/themes";
import { UIMessage } from "ai"
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";

export type MessagesProps = {
    isLoading: boolean;
    error: Error | undefined;
    messages: UIMessage[];
    onDefaultQuestionsClick: (question: string) => void;
}

const QUESTION_SET = [
    "What’s the average house price in the UK this year?",
    "What are the housing trends in London?",
    "Can you show me a chart of average prices over the past 6 months?",
    "Is the market more active now compared to last year?"
]

export const Messages = ({ onDefaultQuestionsClick, error, isLoading, messages }: MessagesProps) => {
    return (
        <ScrollArea type="auto" scrollbars="vertical" style={{ height: '70vh', padding: '1rem', borderRadius: 'var(--radius-4)' }} data-testid="scroll-area">
            <Flex gap="2">

                {messages.length === 0 && <div>
                    <Flex gap="2" direction="column">
                        {QUESTION_SET.map(item => (<Button variant="soft" onClick={() => onDefaultQuestionsClick(item)} style={{ justifyContent: 'flex-start' }} size="3" key={item}>{item}</Button>))}
                    </Flex>
                </div>}

                {messages && (
                    <Flex direction="column" gap="2" data-testid="completion">
                        {/* TODO: styles for mobile */}
                        {messages.map((message, index) => (
                            (<Box style={message.role === 'user' ? { background: "var(--gray-a2)", alignSelf: 'flex-start', padding: '1rem', marginBottom: 8, borderRadius: "var(--radius-4)" } : undefined} key={index}>
                                <Strong>{message.role === 'user' ? '' : 'AI: '}</Strong>

                                {status === 'submitted' && message.role === 'assistant' && <div>
                                    <Spinner />
                                    <VisuallyHidden>Loading...</VisuallyHidden>
                                </div>}

                                <MarkdownComponent content={`${message.content}`} key={`${message}_${index}`} />
                            </Box>)
                        ))}
                    </Flex>
                )}
            </Flex>

            <div aria-live="polite">
                {isLoading && error && (
                    <Callout.Root color="red">
                        <Callout.Text>
                            {error.message.includes('limit') ? 'You have reached the limit of requests.' : 'Sorry, something went wrong.'}
                        </Callout.Text>
                    </Callout.Root>
                )}
            </div>
        </ScrollArea>
    )
}

export default Messages;