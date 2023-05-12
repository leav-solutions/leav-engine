// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {layoutElements} from '../../..';
import {FormElementTypes} from '../../../../../../../../../../../../_gqlTypes/globalTypes';
import {defaultContainerId} from '../../../../formBuilderReducer/formBuilderReducer';
import {IFormElement, UIElementTypes} from '../../../../_types';
import EditTabLabelModal from './EditTabLabelModal';

jest.mock('../../../../../../../../../../../../hooks/useLang');

describe('EditTabLabelModal', () => {
    test('Snapshot test', async () => {
        const tabElementData: IFormElement = {
            id: '123456',
            containerId: defaultContainerId,
            type: FormElementTypes.layout,
            order: 0,
            settings: {
                tabs: [
                    {
                        id: '12345',
                        label: {fr: 'test_tab'}
                    },
                    {
                        id: '98765',
                        label: {fr: 'test_tab 2'}
                    }
                ]
            },
            uiElement: layoutElements[UIElementTypes.TABS]
        };

        const comp = shallow(
            <EditTabLabelModal
                tabsElement={tabElementData}
                tab={{
                    id: '12345',
                    label: {fr: 'test_tab'}
                }}
                onClose={jest.fn()}
                open
            />
        );

        expect(comp.find('Input[name="fr"]')).toHaveLength(1);
        expect(comp.find('Input[name="en"]')).toHaveLength(1);
    });
});
