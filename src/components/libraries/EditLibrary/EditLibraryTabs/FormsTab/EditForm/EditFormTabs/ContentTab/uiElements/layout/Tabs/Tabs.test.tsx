import {shallow} from 'enzyme';
import React from 'react';
import {layoutElements} from '../..';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {defaultContainerId} from '../../../formBuilderReducer/formBuilderReducer';
import {initialState} from '../../../formBuilderReducer/_fixtures/fixtures';
import {UIElementTypes} from '../../../_types';
import Tabs, {ITabSettings} from './Tabs';

jest.mock('../../../../../../../../../../../hooks/useLang');

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

        const comp = shallow(
            <Tabs elementData={tabElementData} settings={{tabs}} dispatch={jest.fn()} state={initialState} />
        );

        expect(comp.find('Tab').prop('panes')).toHaveLength(3);
    });
});
