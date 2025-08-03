import { Em, Heading, Link, Separator, Strong, Text } from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MarkdownComponent.module.css';

type MarkdownComponentProps = {
    content: unknown
};

export const MarkdownComponent = ({ content }: MarkdownComponentProps) => {

    if (typeof content !== 'string') {
        return null;
    }

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
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
                    <ol className={styles.list}>{children}</ol>),
                ul: ({ children }) => (
                    <ul className={styles.list}>{children}</ul>),
                li: ({ children }) => (
                    <li>{children}</li>),
                hr: () => (
                    <Separator my="3" size="4" />
                ),
                // TODO: add in prompt for no ONS image
                img: () => (
                    null
                )
            }}
            children={content}
        />
    );
}