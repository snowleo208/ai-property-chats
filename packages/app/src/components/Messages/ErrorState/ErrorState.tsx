import { Box, Callout } from "@radix-ui/themes"

export const ErrorState = ({ key = 'general-error-state' }: { key?: string }) => {
    return (
        <Box pt="2" key={key}>
            <Callout.Root variant="surface" size="1" color="red">
                <Callout.Icon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                    </svg>
                </Callout.Icon>
                <Callout.Text>
                    Something went wrong. Please try again.
                </Callout.Text>
            </Callout.Root>
        </Box>
    )
}