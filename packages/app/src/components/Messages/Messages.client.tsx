'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { Box, Card, Flex, IconButton, Spinner, Text } from "@radix-ui/themes";
import { isToolUIPart, ToolUIPart, UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { MarkdownComponent } from "../MarkdownComponent/MarkdownComponent.client";
import { WelcomeScreen } from '../WelcomeScreen/WelcomeScreen';
import styles from './Messages.module.css';
import { ToolStatus } from '../ToolStatus/ToolStatus.client';
import { LoadingState } from './LoadingState/LoadingState';
import { ErrorState } from './ErrorState/ErrorState';
import { chartSchema } from './Message.types';

const DynamicCharts = dynamic(() => import('../Charts/Charts.client'), {
    ssr: false
});

const toolMaps: Record<`tool-${string}`, { name: string; loadingText: string; completeText: string }> = {
    'tool-matchRegionForRental': {
        name: 'matchRegionForRental',
        loadingText: 'Checking which regions are available for rental data...',
        completeText: 'Found available regions for rental data'
    },
    'tool-matchRegionForSale': {
        name: 'matchRegionForSale',
        loadingText: 'Checking which regions are available for sale data...',
        completeText: 'Found available regions for house price data'
    },
    'tool-findAffordableRegions': {
        name: 'findAffordableRegions',
        loadingText: 'Looking up affordable regions',
        completeText: 'Available regions retrieved'
    },
    'tool-getRentPrices': {
        name: 'getRentPrices',
        loadingText: 'Checking rental prices...',
        completeText: 'Retrieved rental prices'
    },
    'tool-getHousePrices': {
        name: 'getHousePrices',
        loadingText: 'Checking house price data...',
        completeText: 'Retrieved house price data'
    },
    'tool-getHousePricesByPostcodeAndPropertyType': {
        name: 'getHousePricesByPostcodeAndPropertyType',
        loadingText: 'Checking house prices by property type...',
        completeText: 'Retrieved house prices by property type'
    },
    'tool-getHousePricesByPostcode': {
        name: 'getHousePricesByPostcode',
        loadingText: 'Checking house prices by postcode...',
        completeText: 'Retrieved house prices by postcode'
    },
};

const isValidTool = (toolId: UIMessagePart<UIDataTypes, UITools>): toolId is ToolUIPart => {
    if (!isToolUIPart(toolId)) {
        return false;
    }

    return Object.keys(toolMaps).includes(toolId?.type);
}

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

    const renderFunction = (part: UIMessagePart<UIDataTypes, UITools>, partIndex: number,) => {
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
                    const result = chartSchema.safeParse(part.output);
                    if (result.success) {
                        return (
                            <div key={`chart-${part.toolCallId}_${partIndex}`}>
                                <div data-testid={`chart-${part.toolCallId}_${partIndex}`} key={part.toolCallId}>
                                    <DynamicCharts data={result.data} />
                                </div>
                            </div>
                        );
                    }
                case 'output-error':
                    return <div key={`generateChart_${part.toolCallId}`}>Error: {part.errorText}</div>;
                default:
                    return null;
            }
        }

        if (isValidTool(part)) {
            // console.log(messages)
            const tool = toolMaps[part.type];
            if (!tool) {
                return null;
            }
            return (
                <ToolStatus
                    key={`${part.toolCallId}_${partIndex}`}
                    toolName={tool?.name}
                    loadingText={tool?.loadingText}
                    completeText={tool?.completeText}
                    state={part.state}
                    toolId={part.toolCallId}
                    content={part.output}
                />
            );
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