import { Spinner, VisuallyHidden } from "@radix-ui/themes";

export const LoadingState = ({ key = 'general-loading-state' }: { key?: string }) => {
    return (
        <div key={key}>
            <Spinner />
            <VisuallyHidden>Loading...</VisuallyHidden></div>
    )
};