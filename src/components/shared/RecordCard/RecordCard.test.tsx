import {mount, shallow} from 'enzyme';
import 'jest-styled-components';
import React from 'react';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import RecordCard from './RecordCard';

describe('RecordCard', () => {
    const mockRecord: RecordIdentity_whoAmI = {
        id: '12345',
        library: {
            id: 'test_lib',
            label: {fr: 'Test Lib'}
        },
        label: 'Test Record',
        color: null,
        preview: null
    };

    test('Snapshot test', async () => {
        const comp = shallow(<RecordCard record={mockRecord} />);

        expect(comp.find('RecordPreview')).toHaveLength(1);
        expect(comp.text()).toMatch('Test Record');
    });

    test('Allow styling', async () => {
        const comp = mount(<RecordCard record={mockRecord} style={{background: 'blue'}} />);

        expect(comp.find('Wrapper')).toHaveStyleRule('background', 'blue');
    });
});
