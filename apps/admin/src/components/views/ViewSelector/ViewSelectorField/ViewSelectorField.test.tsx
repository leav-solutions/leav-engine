// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {GET_VIEWS_views_list} from '../../../../_gqlTypes/GET_VIEWS';
import ViewSelectorField from './ViewSelectorField';

jest.mock('../../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr'])
}));

jest.mock('../../../../hooks/useLang');

describe('AttributesSelectorField', () => {
    test('Render dropdown with attributes', async () => {
        const views: GET_VIEWS_views_list[] = [
            {
                id: '123456',
                label: {fr: 'Test View'}
            },
            {
                id: '123457',
                label: {fr: 'Test View 2'}
            }
        ];

        const comp = shallow(<ViewSelectorField views={views} />);

        expect(comp.find('FormDropdown').prop('options')).toHaveLength(3);
    });
});
