'use client';

import dynamic from 'next/dynamic';

import { Button, Callout, Flex, Grid, Heading, ScrollArea, Spinner } from "@radix-ui/themes";
import { UIMessage } from "ai"
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";

const DynamicCharts = dynamic(() => import('../Charts/Charts.client'), {
    ssr: false
});

export type MessagesProps = {
    isLoading: boolean;
    error: Error | undefined;
    messages: UIMessage[];
    onDefaultQuestionsClick: (question: string) => void;
    status: "submitted" | "streaming" | "ready" | "error";
}

const QUESTION_SET = [
    "What’s the average house price in the UK this year?",
    "What are the housing trends in London?",
    "Show me a chart of average prices over the past 6 months",
    "Is the market more active now compared to last year?"
]

export const Messages = ({ onDefaultQuestionsClick, error, messages }: MessagesProps) => {
    return (
        <ScrollArea type="auto" scrollbars="vertical" style={{ height: '70vh', padding: '1rem', borderRadius: 'var(--radius-4)' }} data-testid="scroll-area">
            <Flex direction="column" width="100%" gap="2">

                {messages.length === 0 &&

                    <Flex direction="column" gapY="4">
                        <Heading as="h1">How can I help you today?</Heading>
                        <Grid gap="3" width="100%">
                            {QUESTION_SET.map(item => (
                                <Button
                                    variant="soft"
                                    onClick={() => onDefaultQuestionsClick(item)}
                                    style={{ justifyContent: 'flex-start' }}
                                    size="3"
                                    key={item}>
                                    {item}
                                </Button>
                            ))}
                        </Grid>
                    </Flex>

                }

                {messages && (
                    <Flex direction="column" gap="2" data-testid="completion" width="100%">
                        {/* TODO: styles for mobile */}
                        {messages.map((message, index) => (
                            (<Flex direction="column" gap="2" style={message.role === 'user' ? { background: "var(--gray-a2)", alignSelf: 'flex-end', borderRadius: "var(--radius-4)" } : undefined} key={index} p="3">
                                <MarkdownComponent content={`${message.content}`} key={`${message}_${index}`} />


                                <>
                                    {message.toolInvocations?.map(toolInvocation => {
                                        const { toolName, toolCallId, state } = toolInvocation;

                                        if (state === 'result') {
                                            if (toolName === 'generateChart') {
                                                const { result } = toolInvocation;
                                                return (
                                                    <div data-testid={`chart-${toolCallId}`} key={toolCallId}>
                                                        <DynamicCharts data={result} />
                                                    </div>
                                                );
                                            }
                                        } else {
                                            return (
                                                <div key={toolCallId}>
                                                    {toolName === 'generateChart' ? (
                                                        <div><Spinner /> Loading charts...</div>
                                                    ) : null}
                                                </div>
                                            );
                                        }
                                    })}
                                </>
                            </Flex>)
                        ))}
                    </Flex>
                )}
            </Flex>

            <div aria-live="polite">
                {error && (
                    <Callout.Root color="red">
                        <Callout.Text>
                            Sorry, something went wrong, please try again.
                        </Callout.Text>
                    </Callout.Root>
                )}
            </div>
        </ScrollArea>
    )
}

export default Messages;