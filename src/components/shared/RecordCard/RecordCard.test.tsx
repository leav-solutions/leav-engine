import {shallow} from 'enzyme';
import * as React from 'react';
import {RecordIdentity_whoAmI} from 'src/_gqlTypes/RecordIdentity';
import RecordCard from './RecordCard';

describe('RecordCard', () => {
    test('Snapshot test', async () => {
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
        const comp = shallow(<RecordCard record={mockRecord} />);

        expect(comp).toMatchSnapshot();
    });
});
