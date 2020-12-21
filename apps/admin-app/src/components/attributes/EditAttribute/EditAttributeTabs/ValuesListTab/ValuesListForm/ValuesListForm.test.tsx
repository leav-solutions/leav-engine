// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {
    mockAttrAdvLinkWithValuesList,
    mockAttrSimpleLinkWithValuesList,
    mockAttrSimpleWithValuesList
} from '../../../../../../__mocks__/attributes';
import ValuesListForm from './ValuesListForm';

jest.mock(
    './StandardValuesList',
    () =>
        function StandardValuesList() {
            return <div>StandardValuesList</div>;
        }
);

jest.mock(
    './LinkValuesList',
    () =>
        function LinkValuesList() {
            return <div>LinkValuesList</div>;
        }
);

describe('ValuesListForm', () => {
    test('Load existing conf', async () => {
        const onSubmit = jest.fn();
        const comp = shallow(<ValuesListForm attribute={{...mockAttrSimpleWithValuesList}} onSubmit={onSubmit} />);

        expect(comp.find('FormCheckbox[name="enable"]').prop('checked')).toBe(true);
        expect(comp.find('FormCheckbox[name="allowFreeEntry"]').prop('checked')).toBe(false);
    });

    test('When disabled, hide values list', async () => {
        const onSubmit = jest.fn();
        const comp = shallow(
            <ValuesListForm
                attribute={{
                    ...mockAttrSimpleWithValuesList,
                    values_list: {enable: false, allowFreeEntry: null, values: null}
                }}
                onSubmit={onSubmit}
            />
        );

        expect(comp.find('FormCheckbox[name="enable"]').prop('checked')).toBe(false);
        expect(comp.find('FormCheckbox[name="allowFreeEntry"]')).toHaveLength(0);
        expect(comp.find('[data-test-id="values-list-wrapper"]')).toHaveLength(0);
    });

    test('When changing any value, calls onSubmit ', async () => {
        const onSubmit = jest.fn();
        const comp = mount(<ValuesListForm attribute={{...mockAttrSimpleWithValuesList}} onSubmit={onSubmit} />);

        act(() => {
            comp.find('FormCheckbox[name="allowFreeEntry"] input').simulate('change');
        });

        act(() => {
            comp.find('FormCheckbox[name="enable"] input').simulate('change');
        });

        expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    test('Render form based on attribute type', () => {
        const onSubmit = jest.fn();

        // Simple
        const compStd = shallow(<ValuesListForm attribute={{...mockAttrSimpleWithValuesList}} onSubmit={onSubmit} />);
        expect(compStd.find('StandardValuesList')).toHaveLength(1);

        // Simple link
        const compLink = shallow(
            <ValuesListForm attribute={{...mockAttrSimpleLinkWithValuesList}} onSubmit={onSubmit} />
        );
        expect(compLink.find('LinkValuesList')).toHaveLength(1);

        // Advanced Link
        const compAdvLink = shallow(
            <ValuesListForm attribute={{...mockAttrAdvLinkWithValuesList}} onSubmit={onSubmit} />
        );
        expect(compAdvLink.find('LinkValuesList')).toHaveLength(1);
    });
});
