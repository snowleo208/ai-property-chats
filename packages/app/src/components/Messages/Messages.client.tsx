'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { Box, Callout, Card, Flex, IconButton, ScrollArea, Spinner, Text } from "@radix-ui/themes";
import { ToolInvocation, UIMessage } from "ai"
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';

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

export const Messages = ({ onDefaultQuestionsClick, error, messages }: MessagesProps) => {
    const [isAtBottom, setIsAtBottom] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const generateTools = (toolInvocation: ToolInvocation) => {
        const { toolName, toolCallId, state } = toolInvocation;

        if (state === 'result' && toolName === 'generateChart') {
            const { result } = toolInvocation;
            return (
                <div data-testid={`chart-${toolCallId}`} key={toolCallId}>
                    <DynamicCharts data={result} />
                </div>
            );
        } else if (toolName === 'generateChart') {
            return (
                <div key={toolCallId}>
                    {toolName === 'generateChart' ? (
                        <Box my="2" maxWidth="90%">
                            <Card>
                                <Flex minHeight="400px" gap="3" align="start">
                                    <Spinner size="3" /> <Text as="p">Loading charts...</Text>
                                </Flex>
                            </Card>
                        </Box>
                    ) : null}
                </div>
            );
        }
    };

    const onBottomButtonClick = () => {
        if (!bottomRef.current) {
            return;
        }

        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setIsAtBottom(true);
    };

    useEffect(() => {
        const resultsGrid = scrollRef.current;
        if (!resultsGrid) {
            return;
        }

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const handleScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const top = resultsGrid.scrollTop;
                const max = resultsGrid.scrollHeight - resultsGrid.clientHeight;

                requestAnimationFrame(() => {
                    const nearBottom = max - top < 50;
                    setIsAtBottom(nearBottom);
                });

            }, 200);
        };

        resultsGrid.addEventListener('scroll', handleScroll);
        return () => {
            resultsGrid.removeEventListener('scroll', handleScroll)
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);


    return (
        <ScrollArea type="auto" scrollbars="vertical" style={{ height: '70vh', padding: '1rem', borderRadius: 'var(--radius-4)' }} data-testid="scroll-area" ref={scrollRef}>
            <Flex direction="column" width="100%" gap="2">

                {messages.length === 0 &&
                    <WelcomeScreen onDefaultQuestionsClick={onDefaultQuestionsClick} />
                }

                {messages && (
                    <Flex direction="column" gap="2" data-testid="completion" width="100%">
                        {/* TODO: styles for mobile */}
                        {messages.map((message, index) => (
                            (<Flex direction="column" gap="2" style={message.role === 'user' ? { background: "var(--gray-a2)", alignSelf: 'flex-end', borderRadius: "var(--radius-4)" } : { minHeight: 500 }} key={index} p="3">
                                <MarkdownComponent content={`${message.content}`} key={`${message}_${index}`} />


                                <>
                                    {message.toolInvocations?.map(generateTools)}
                                </>
                            </Flex>)
                        ))}
                    </Flex>
                )}

                <div ref={bottomRef} />
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

            {!isAtBottom && <Box style={{ position: 'absolute', bottom: 16, left: '50%' }}>
                <IconButton onClick={onBottomButtonClick} variant="surface" color="gray" radius='full'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                    </svg>

                </IconButton>
            </Box>}
        </ScrollArea>
    )
}

export default Messages;