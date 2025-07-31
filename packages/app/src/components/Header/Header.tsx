import { Box, Flex, IconButton, Separator, Text, Tooltip } from "@radix-ui/themes"

type HeaderProps = {
    onClickStartButton: (e: React.FormEvent<HTMLButtonElement>) => void;
}

export const Header = ({ onClickStartButton }: HeaderProps) => {
    return (
        <Box pb="3">
            <Flex gap="3" align="center" p="4">
                <Text weight="light">Jusk Ask House Prices</Text>
                <Tooltip content="New chat">
                    <IconButton radius="full" variant="ghost" onClick={onClickStartButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                        </svg>
                    </IconButton>
                </Tooltip>
            </Flex>
            <Separator my="1" size="4" />
        </Box>
    )
}