import { Button, Flex, Grid, Heading } from "@radix-ui/themes"

type WelcomeScreenProps = {
    onDefaultQuestionsClick: (value: string) => void;
}

const QUESTION_SET = [
    "What’s the average house price in the UK in 2025?",
    "Is it better to rent or buy in London right now?",
    "Did rent prices go up faster than house prices in the last year?",
    "Show me a chart of average prices over the past 6 months in the UK",
    "Is the market in Manchester more active now compared to last year?",
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
                        style={{ justifyContent: 'flex-start' }}
                        size="3"
                        key={item}>
                        {item}
                    </Button>
                ))}
            </Grid>
        </Flex>
    )
}