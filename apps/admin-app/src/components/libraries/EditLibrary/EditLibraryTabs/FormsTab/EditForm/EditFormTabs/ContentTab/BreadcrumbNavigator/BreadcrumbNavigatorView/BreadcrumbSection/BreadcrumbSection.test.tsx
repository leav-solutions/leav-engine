// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {mockTree} from '../../../../../../../../../../../__mocks__/trees';
import {initialState} from '../../../formBuilderReducer/_fixtures/fixtures';
import BreadcrumbSection from './BreadcrumbSection';

jest.mock('../../../../../../../../../../../hooks/useLang');

describe('BreadcrumbSection', () => {
    test('Snapshot test', async () => {
        const comp = render(<BreadcrumbSection treeData={mockTree} dispatch={jest.fn()} state={initialState} />);

        expect(comp).toMatchSnapshot();
    });
});
