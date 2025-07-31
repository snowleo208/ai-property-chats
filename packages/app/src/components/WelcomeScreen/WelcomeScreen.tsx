import { Button, Flex, Grid, Heading } from "@radix-ui/themes"

type WelcomeScreenProps = {
    onDefaultQuestionsClick: (value: string) => void;
}

const QUESTION_SET = [
    "What’s the average house price in the UK this year?",
    "What are the housing trends in London?",
    "Show me a chart of average prices over the past 6 months",
    "Is the market more active now compared to last year?"
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