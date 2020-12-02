// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {IFormBuilderState} from '../formBuilderReducer/formBuilderReducer';
import {initialState} from '../formBuilderReducer/_fixtures/fixtures';
import DependencySettings from './DependencySettings';

jest.mock('../../../../../../../../../hooks/useLang');

describe('DependencySettings', () => {
    test('Render attributes selection', async () => {
        const comp = shallow(<DependencySettings state={initialState} dispatch={jest.fn()} />);

        expect(comp.find('[data-test-id="attribute-selection"]')).toHaveLength(1);
    });

    test('Render attributes selection', async () => {
        const mockState: IFormBuilderState = {...initialState, form: {...initialState.form, dependencyAttributes: []}};
        const comp = shallow(<DependencySettings state={mockState} dispatch={jest.fn()} />);

        expect(comp.find('[data-test-id="attribute-selection"]')).toHaveLength(0);
    });

    test('Dispatch dependency change', async () => {
        const mockDispatch = jest.fn();
        const comp = mount(<DependencySettings state={initialState} dispatch={mockDispatch} />);

        const selector = comp.find('[data-test-id="attribute-selection"]').first();

        act(() => {
            selector.simulate('change', {target: {value: 'my_attribute'}});
        });

        await wait(0);
        comp.update();

        expect(mockDispatch).toBeCalled();
    });
});
