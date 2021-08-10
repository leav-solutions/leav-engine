// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DeleteOutlined} from '@ant-design/icons';
import {render, screen, waitForElement} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import FloatingMenu, {FloatingMenuAction, IFloatingMenuActionWithIcon} from './FloatingMenu';

describe('FloatingMenu', () => {
    test('Display actions with button', async () => {
        const mockActions: FloatingMenuAction[] = [
            {
                title: 'actionA',
                button: <div>my action A</div>
            },
            {
                title: 'actionB',
                button: <div>my action B</div>
            }
        ];

        await act(async () => {
            render(<FloatingMenu actions={mockActions} />);
        });

        expect(screen.getByText('my action A')).toBeInTheDocument();
        expect(screen.getByText('my action B')).toBeInTheDocument();
    });

    test('Display actions with icon', async () => {
        const _handleClick = jest.fn();

        const mockActions: FloatingMenuAction[] = [
            {
                title: 'actionA',
                icon: <DeleteOutlined />,
                onClick: _handleClick
            }
        ];

        await act(async () => {
            render(<FloatingMenu actions={mockActions} />);
        });

        const actionBtn = screen.getByRole('button', {name: 'delete'});
        expect(actionBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(actionBtn);
        });

        expect(_handleClick).toBeCalled();
    });

    test('Display more actions in dropdown', async () => {
        const mockActions: FloatingMenuAction[] = [
            {
                title: 'actionA',
                button: <div>my action A</div>
            },
            {
                title: 'actionB',
                button: <div>my action B</div>
            }
        ];

        const mockMoreActions: IFloatingMenuActionWithIcon[] = [
            {
                title: 'moreActionA',
                icon: <DeleteOutlined />,
                onClick: jest.fn()
            }
        ];

        await act(async () => {
            render(<FloatingMenu actions={mockActions} moreActions={mockMoreActions} />);
        });

        const moreBtn = screen.getByRole('button', {name: 'floating_menu.more_actions'});
        await act(async () => {
            userEvent.hover(moreBtn, null);
        });

        await waitForElement(() => screen.getByText('moreActionA'));

        expect(screen.getByText('moreActionA')).toBeInTheDocument();
    });
});
