// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {IPrimaryAction} from '_ui/components/Explorer/_types';
import {LinkActionsButtons} from './LinkActionsButtons';
import userEvent from '@testing-library/user-event';

describe('LinkActionsButtons', () => {
    const createButtonProps: IPrimaryAction = {
        icon: <></>,
        label: 'Create',
        disabled: false,
        callback: jest.fn()
    };

    const linkButtonProps: IPrimaryAction = {
        icon: <></>,
        label: 'Link',
        disabled: false,
        callback: jest.fn()
    };

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it('renders both buttons with correct labels', () => {
        render(
            <LinkActionsButtons
                createButtonProps={createButtonProps}
                linkButtonProps={linkButtonProps}
                hasNoValue={false}
            />
        );

        expect(screen.getByRole('button', {name: 'Create'})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Link'})).toBeInTheDocument();
    });

    it('calls the correct callback when create button is clicked', async () => {
        render(
            <LinkActionsButtons
                createButtonProps={createButtonProps}
                linkButtonProps={linkButtonProps}
                hasNoValue={false}
            />
        );

        await user.click(screen.getByRole('button', {name: 'Create'}));
        expect(createButtonProps.callback).toHaveBeenCalled();
    });

    it('calls the correct callback when link button is clicked', async () => {
        render(
            <LinkActionsButtons
                createButtonProps={createButtonProps}
                linkButtonProps={linkButtonProps}
                hasNoValue={false}
            />
        );

        await user.click(screen.getByRole('button', {name: 'Link'}));
        expect(linkButtonProps.callback).toHaveBeenCalled();
    });

    it('disables the buttons when disabled prop is true', () => {
        render(
            <LinkActionsButtons
                createButtonProps={{...createButtonProps, disabled: true}}
                linkButtonProps={{...linkButtonProps, disabled: true}}
                hasNoValue={false}
            />
        );

        expect(screen.getByRole('button', {name: 'Create'})).toBeDisabled();
        expect(screen.getByRole('button', {name: 'Link'})).toBeDisabled();
    });

    it('applies margin-top when hasNoValue is false', () => {
        render(
            <LinkActionsButtons
                createButtonProps={createButtonProps}
                linkButtonProps={linkButtonProps}
                hasNoValue={false}
            />
        );

        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button).toHaveStyle('margin-top: calc((var(--general-spacing-xs)) * 1px)');
        });
    });
});
