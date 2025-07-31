import React, { lazy, Suspense } from 'react';
import { Em, Heading, Link, Separator, Strong, Text } from '@radix-ui/themes';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type CustomComponents = Components & {
    [key: string]: any; // allow unknown tag handlers
};

type MarkdownComponentProps = {
    content: string
};

const DynamicCharts = lazy(() => import('../Charts/Charts.client'));

export const MarkdownComponent = ({ content }: MarkdownComponentProps) => {
    const customComponents: CustomComponents = {
        // TODO: fix `any` here
        'echarts-option': ({ children }: any) => {
            return <Suspense fallback={<div></div>}><DynamicCharts data={children} /></Suspense>;
        }
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                ...customComponents,
                h1: ({ children }) => (
                    <Heading as="h1">
                        {children}
                    </Heading>
                ),
                h2: ({ children }) => (
                    <Heading as="h2">
                        {children}
                    </Heading>
                ),
                h3: ({ children }) => (
                    <Heading as="h3">
                        {children}
                    </Heading>
                ),
                h4: ({ children }) => (
                    <Heading as="h4">
                        {children}
                    </Heading>
                ),
                h5: ({ children }) => (
                    <Heading as="h5">
                        {children}
                    </Heading>
                ),
                h6: ({ children }) => (
                    <Heading as="h6">
                        {children}
                    </Heading>
                ),
                p: ({ children }) => (
                    <Text as="p" size="3">
                        {children}
                    </Text>
                ),
                strong: ({ children }) => (
                    <Strong>
                        {children}
                    </Strong>
                ),
                em: ({ children }) => (
                    <Em>
                        {children}
                    </Em>
                ),
                a: ({ children, href }) => (
                    <Link underline="always" target="_blank" referrerPolicy="no-referrer" href={href}>{children}</Link>),
                ol: ({ children }) => (
                    <ol>{children}</ol>),
                ul: ({ children }) => (
                    <ul>{children}</ul>),
                li: ({ children }) => (
                    <li>{children}</li>),
                hr: () => (
                    <Separator my="3" size="4" />
                )
            }}
            children={content}
        />
    );
}