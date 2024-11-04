// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {mockTree} from '../../../../../../../../../../../__mocks__/trees';
import BreadcrumbSection from './BreadcrumbSection';

jest.mock('../../../../../../../../../../../hooks/useLang');
jest.mock('../../../formBuilderReducer/hook/useFormBuilderReducer');

describe('BreadcrumbSection', () => {
    test('Snapshot test', async () => {
        const comp = render(<BreadcrumbSection treeData={mockTree} />);

        expect(comp).toMatchSnapshot();
    });
});
