// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {wait} from 'utils/testUtils';
import {IFormBuilderState} from '../formBuilderReducer/formBuilderReducer';
import * as useFormBuilderReducer from '../formBuilderReducer/hook/useFormBuilderReducer';
import {mockInitialState} from '../formBuilderReducer/_fixtures/fixtures';
import DependencySettings from './DependencySettings';

jest.mock('../../../../../../../../../hooks/useLang');
jest.mock('../formBuilderReducer/hook/useFormBuilderReducer');

describe('DependencySettings', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Render attributes selection', async () => {
        const comp = shallow(<DependencySettings />);

        expect(comp.find('[data-test-id="attribute-selection"]')).toHaveLength(1);
    });

    test('Render attributes selection', async () => {
        const mockState: IFormBuilderState = {
            ...mockInitialState,
            form: {...mockInitialState.form, dependencyAttributes: []}
        };

        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockImplementation(() => ({
            state: mockState,
            dispatch: jest.fn()
        }));

        const comp = shallow(<DependencySettings />);

        expect(comp.find('[data-test-id="attribute-selection"]')).toHaveLength(0);
    });

    test('Dispatch dependency change', async () => {
        const mockDispatch = jest.fn();

        jest.spyOn(useFormBuilderReducer, 'useFormBuilderReducer').mockImplementation(() => ({
            state: mockInitialState,
            dispatch: mockDispatch
        }));

        const comp = mount(<DependencySettings />);

        const selector = comp.find('[data-test-id="attribute-selection"]').first();

        act(() => {
            selector.simulate('change', {target: {value: 'my_attribute'}});
        });

        await wait(0);
        comp.update();

        expect(mockDispatch).toBeCalled();
    });
});
