import {shallow} from 'enzyme';
import React from 'react';
import {layoutElements} from '../../..';
import {FormElementTypes} from '../../../../../../../../../../../../_gqlTypes/globalTypes';
import {defaultContainerId} from '../../../../formBuilderReducer/formBuilderReducer';
import {initialState} from '../../../../formBuilderReducer/_fixtures/fixtures';
import {UIElementTypes} from '../../../../_types';
import EditTabLabelModal from './EditTabLabelModal';

jest.mock('../../../../../../../../../../../../hooks/useLang');

describe('EditTabLabelModal', () => {
    test('Snapshot test', async () => {
        const tabElementData = {
            id: '123456',
            containerId: defaultContainerId,
            type: FormElementTypes.layout,
            order: 0,
            settings: [
                {
                    id: '12345',
                    label: {fr: 'test_tab'}
                },
                {
                    id: '98765',
                    label: {fr: 'test_tab 2'}
                }
            ],
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
                dispatch={jest.fn()}
                state={initialState}
                open
            />
        );

        expect(comp.find('Input[name="fr"]')).toHaveLength(1);
        expect(comp.find('Input[name="en"]')).toHaveLength(1);
    });
});
