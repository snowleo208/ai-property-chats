export const ToolStatus = ({ state, toolName, toolId, loadingText, completeText, content }: {
    state: string;
    toolName: string;
    toolId: string;
    loadingText: string;
    completeText: string;
    content?: unknown;
}) => {
    switch (state) {
        case 'output-available':
            return <div key={`${toolName}_${toolId}`}>
                <details>
                    <summary>
                        {completeText}
                    </summary>
                    <code>{JSON.stringify(content)}</code>
                </details>

            </div>

        case 'output-error':
            return <div key={`${toolName}_${toolId}`}>Error: failed to get data, please try again.</div>;
        default:
            return <div key={`${toolName}_${toolId}`}>{loadingText}</div>
    }
};