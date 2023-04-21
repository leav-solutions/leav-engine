// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {mockTree} from '../../../__mocks__/trees';
import TreesSelectorField from './TreesSelectorField';

jest.mock('../../../hooks/useLang');

describe('TreesSelectorField', () => {
    const trees: GET_TREES_trees_list[] = [
        {
            ...mockTree,
            id: 'tree1',
            label: {
                fr: 'Tree 1',
                en: 'Tree 1'
            }
        },
        {
            ...mockTree,
            id: 'tree2',
            label: {
                fr: 'Tree 2',
                en: 'Tree 2'
            }
        }
    ];

    test('Render a dropdown with trees', async () => {
        render(<TreesSelectorField trees={trees} />);
        expect(screen.getAllByRole('option')).toHaveLength(2);
    });

    test('Render Loading', async () => {
        render(<TreesSelectorField loading trees={[]} />);

        expect(screen.getByRole('combobox').className).toContain('loading');
    });

    test('Pass value down to dropdown', async () => {
        render(<TreesSelectorField trees={trees} value={['attr2']} />);

        expect(screen.getByRole('option', {name: 'Tree 1'}).className).toContain('selected');
    });
});
