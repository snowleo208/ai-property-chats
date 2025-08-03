'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { Box, Card, Flex, IconButton, Spinner, Text } from "@radix-ui/themes";
import { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import styles from './Messages.module.css';
import { ToolStatus } from '../ToolStatus/ToolStatus.client';
import { LoadingState } from './LoadingState/LoadingState';
import { ErrorState } from './ErrorState/ErrorState';

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
                    const nearBottom = max - top < (resultsGrid.scrollHeight * 0.3);
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

    // TODO: split it better
    const renderFunction = (part: UIMessagePart<UIDataTypes, UITools>, partIndex: number,) => {

        if (part.type === 'tool-getAvailableRegionsForRental') {
            return <ToolStatus state={part.state} toolName='getAvailableRegions' toolId={part.toolCallId} loadingText='Checking which regions are available for rental data...' completeText='Found available regions for rental data' key={`getAvailableRegions_${part.toolCallId}`} content={part.output} />
        }

        if (part.type === 'tool-getAvailableRegionsForSale') {
            return <ToolStatus state={part.state} toolName='getAvailableRegionsForSale' toolId={part.toolCallId} loadingText="Checking which regions are available for sale data..." completeText='Found available regions for house price data' key={`getAvailableRegionsForSale_${part.toolCallId}`} content={part.output} />
        }

        if (part.type === 'tool-findAffordableRegions') {
            return <ToolStatus state={part.state} toolName='findAffordableRegions' toolId={part.toolCallId} loadingText='Looking up affordable regions' completeText="Available regions retrieved" content={part.output} key={`findAffordableRegions_${part.toolCallId}`} />
        }

        if (part.type === 'tool-getRentPrices') {
            switch (part.state) {
                case 'output-available':
                    return <div key={`getRentPrices_${part.toolCallId}`}>
                        <details>
                            <summary>
                                Retrieved rental data
                            </summary>
                            <code>{JSON.stringify(part.output)}</code>
                        </details>

                    </div>

                case 'output-error':
                    return <div key={`getRentPrices${part.toolCallId}`}>Error: failed to get rental data, please retry.</div>;
                default:
                    return <div key={`getRentPrices${part.toolCallId}`}>Checking rental data...</div>
            }
        }

        if (part.type === 'tool-getHousePrices') {
            switch (part.state) {
                case 'output-available':
                    return <div key={`getHousePrices_${part.toolCallId}`}>
                        <details>
                            <summary>
                                Retrieved house price data
                            </summary>
                            <code>{JSON.stringify(part.output)}</code>
                        </details>

                    </div>

                case 'output-error':
                    return <div key={`getHousePrices_${part.toolCallId}`}>Error: failed to get house prices data, please try again.</div>;
                default:
                    return <div key={`getHousePrices_${part.toolCallId}`}>Checking house price data...</div>
            }
        }

        if (part.type === 'tool-generateChart') {
            switch (part.state) {
                case 'input-available':
                case 'input-streaming':
                    return <div key={`${part.toolCallId}_${partIndex}_loading`}>
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
                        <div key={`chart-${part.toolCallId}_${partIndex}`}>
                            <div data-testid={`chart-${part.toolCallId}_${partIndex}`} key={part.toolCallId}>
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
            return (<MarkdownComponent content={`${part.text}`} key={`${part.text}_${partIndex}`} />)
        }
    };

    return (
        <Box className={styles.messages} data-testid="scroll-area" ref={scrollRef}>
            <Flex direction="column" width="100%" gap="3">
                {messages.length === 0 &&
                    <WelcomeScreen onDefaultQuestionsClick={onDefaultQuestionsClick} />
                }

                {messages && (
                    <Flex direction="column" gap="2" data-testid="completion" width="100%">
                        {messages.map((message, index) => (
                            (<Flex direction="column" gap="5" className={message.role === 'user' ? styles.userMessage : styles.assistantMessage} key={`${message.role}_${index}`} p="3">
                                {message.parts?.map(renderFunction)}
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

            {!isAtBottom && messages.length > 0 && <Box className={styles.bottomButton}>
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