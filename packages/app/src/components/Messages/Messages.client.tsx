'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { Box, Callout, Card, Flex, IconButton, Spinner, Text, VisuallyHidden } from "@radix-ui/themes";
import { UIMessage } from "ai"
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import styles from './Messages.module.css';

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

const LoadingState = ({ key = 'general-loading-state' }: { key?: string }) => {
    return (
        <div key={key}>
            <Spinner />
            <VisuallyHidden>Loading...</VisuallyHidden></div>
    )
};

const ErrorState = ({ key = 'general-error-state' }: { key?: string }) => {
    return (
        <Box pt="2" key={key}>
            <Callout.Root variant="surface" size="1" color="red">
                <Callout.Icon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                    </svg>
                </Callout.Icon>
                <Callout.Text>
                    Something went wrong. Please try again.
                </Callout.Text>
            </Callout.Root>
        </Box>
    )
}

export const Messages = ({ status, onDefaultQuestionsClick, error, messages }: MessagesProps) => {
    const [isAtBottom, setIsAtBottom] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

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
                    const nearBottom = max - top < (resultsGrid.scrollHeight * 0.1);
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

    // console.log({ messages })

    return (
        <Box className={styles.messages} data-testid="scroll-area" ref={scrollRef}>
            <Flex direction="column" width="100%" gap="2">
                {messages.length === 0 &&
                    <WelcomeScreen onDefaultQuestionsClick={onDefaultQuestionsClick} />
                }

                {messages && (
                    <Flex direction="column" gap="2" data-testid="completion" width="100%">
                        {messages.map((message, index) => (
                            (<Flex direction="column" gap="2" className={message.role === 'user' ? styles.userMessage : styles.assistantMessage} key={index} p="3">
                                {message.parts?.map((part, partIndex) => {

                                    if (part.type === 'tool-getAvailableRegions') {
                                        switch (part.state) {
                                            case 'output-available':
                                                return null;
                                            case 'output-error':
                                                return <ErrorState key={`tool-getAvailableRegions_${part.toolCallId}_${partIndex}`} />;
                                            default:
                                                return <LoadingState key={`tool-getAvailableRegions_${part.toolCallId}_${partIndex}`} />;
                                        }
                                    }

                                    if (part.type === 'tool-getHousePrices') {
                                        switch (part.state) {
                                            case 'output-available':
                                                return <div key={`getHousePrices_${part.toolCallId}`}>
                                                    <details>
                                                        <summary>
                                                            Finished getting house prices data
                                                        </summary>
                                                        <code>{JSON.stringify(part.output)}</code>
                                                    </details>

                                                </div>

                                            case 'output-error':
                                                return <div key={`getHousePrices_${part.toolCallId}`}>Error: failed to get house prices, please retry.</div>;
                                            default:
                                                return <div key={`getHousePrices_${part.toolCallId}`}>Getting house prices data...</div>
                                        }
                                    }

                                    if (part.type === 'tool-generateChart') {
                                        switch (part.state) {
                                            case 'input-available':
                                            case 'input-streaming':
                                                return <div key={`${part.toolCallId}_${index}_loading`}>
                                                    <Box my="2" maxWidth="90%">
                                                        <Card>
                                                            <Flex minHeight="400px" gap="3" align="start">
                                                                <Spinner size="3" /> <Text as="p">Loading charts...</Text>
                                                            </Flex>
                                                        </Card>
                                                    </Box>
                                                </div>;
                                            case 'output-available':
                                                return (
                                                    <div key={`chart-${part.toolCallId}_${index}`}>
                                                        <div data-testid={`chart-${part.toolCallId}_${index}`} key={part.toolCallId}>
                                                            <DynamicCharts data={part.output} />
                                                        </div>
                                                    </div>
                                                );
                                            case 'output-error':
                                                return <div key={`generateChart_${part.toolCallId}`}>Error: {part.errorText}</div>;
                                            default:
                                                return null;
                                        }
                                    }

                                    if (part.type === 'text') {
                                        return (<MarkdownComponent content={`${part.text}`} key={`${part.text}_${index}`} />)
                                    }
                                })}
                            </Flex>)
                        ))}
                    </Flex>
                )}

                {status === 'submitted' && <LoadingState />}

                <div ref={bottomRef} />
            </Flex>

            <div aria-live="polite">
                {error && (
                    <ErrorState />
                )}
            </div>

            {!isAtBottom && <Box className={styles.bottomButton}>
                <IconButton onClick={onBottomButtonClick} variant="surface" color="gray" radius='full'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                    </svg>
                </IconButton>
            </Box>}
        </Box>
    )
}

export default Messages;