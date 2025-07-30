import { ReactElement } from 'react';
import {
    render,
    RenderOptions,
    RenderResult,
} from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { Theme } from '@radix-ui/themes';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <Theme accentColor="indigo" grayColor="mauve" radius="large" scaling="100%">
            {children}
        </Theme>
    );
};

const renderWithProviders = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { user: UserEvent } => {
    const user = userEvent.setup();
    return {
        user,
        ...render(ui, { wrapper: AllProviders, ...options })
    };
};

export { renderWithProviders };
