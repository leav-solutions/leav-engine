// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {layoutElements} from '../..';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {defaultContainerId} from '../../../formBuilderReducer/formBuilderReducer';
import {UIElementTypes} from '../../../_types';
import Tabs, {ITabSettings} from './Tabs';

jest.mock('../../../../../../../../../../../hooks/useLang');
jest.mock('../../../formBuilderReducer/formBuilderReducer');

describe('Tabs', () => {
    test('Render tabs', async () => {
        const tabs: ITabSettings[] = [
            {
                id: '12345',
                label: {fr: 'test_tab'}
            },
            {
                id: '98765',
                label: {fr: 'test_tab 2'}
            }
        ];

        const tabElementData = {
            id: '123456',
            containerId: defaultContainerId,
            type: FormElementTypes.layout,
            order: 0,
            settings: {},
            uiElement: layoutElements[UIElementTypes.TABS]
        };

        const comp = shallow(<Tabs elementData={tabElementData} settings={{tabs}} />);

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });
});
