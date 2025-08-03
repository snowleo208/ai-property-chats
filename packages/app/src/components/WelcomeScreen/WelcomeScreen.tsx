import { Button, Flex, Grid, Heading } from "@radix-ui/themes"
import styles from './WelcomeScreen.module.css';

type WelcomeScreenProps = {
    onDefaultQuestionsClick: (value: string) => void;
}

const QUESTION_SET = [
    "What’s the average house prices across the UK over the last 6 months?",
    "Is it better to rent or buy in London right now?",
    "Is the market in Manchester more active now compared to last year?",
    "Show me a chart of average prices over the past 10 years in the UK",
    "Where can I buy a flat for under £250,000?"
]

export const WelcomeScreen = ({ onDefaultQuestionsClick }: WelcomeScreenProps) => {
    return (
        <Flex direction="column" gapY="4">
            <Heading as="h1">How can I help you today?</Heading>
            <Grid gap="3" width="100%">
                {QUESTION_SET.map(item => (
                    <Button
                        variant="soft"
                        onClick={() => onDefaultQuestionsClick(item)}
                        className={styles.questionButton}
                        size="3"
                        key={item}>
                        {item}
                    </Button>
                ))}
            </Grid>
        </Flex>
    )
}