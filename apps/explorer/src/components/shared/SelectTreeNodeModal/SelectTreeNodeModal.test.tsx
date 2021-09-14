// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import SelectTreeNodeModal from './SelectTreeNodeModal';

jest.mock('../SelectTreeNode', () => {
    return function SelectTreeNode() {
        return <div>SelectTreeNode</div>;
    };
});

describe('SelectTreeNodeModal', () => {
    test('Should render', async () => {
        const onSubmit = jest.fn();

        await act(async () => {
            render(
                <SelectTreeNodeModal
                    tree={{id: 'treeId', label: {fr: 'tree'}}}
                    visible
                    onSubmit={onSubmit}
                    onClose={jest.fn()}
                />
            );
        });

        expect(screen.getByText('SelectTreeNode')).toBeInTheDocument();

        const applyBtn = screen.getByRole('button', {name: 'global.apply'});

        expect(applyBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(applyBtn);
        });

        expect(onSubmit).toBeCalled();
    });
});
