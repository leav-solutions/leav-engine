import {shallow} from 'enzyme';
import * as React from 'react';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import EditLibraryForm from './EditLibraryForm';

describe('EditLibraryForm', () => {
    beforeAll(() => {
        jest.mock('src/utils/utils', () => ({
            formatIDString: jest.fn().mockImplementation(s => s),
            localizedLabel: jest.fn().mockImplementation(l => l.fr)
        }));
    });

    afterAll(() => {
        jest.unmock('src/utils/utils');
    });

    test('Render form for existing lib', async () => {
        const library = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: false,
            attributes: [
                {
                    id: 'test_attr',
                    type: AttributeType.simple,
                    format: AttributeFormat.text,
                    system: false,
                    label: {fr: 'Test', en: 'Test'}
                }
            ],
            recordIdentityConf: {label: null, color: null, preview: null}
        };
        const onSubmit = jest.fn();

        const comp = shallow(<EditLibraryForm library={library} onSubmit={onSubmit} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test');
    });

    test('Render form for new lib', async () => {
        const onSubmit = jest.fn();

        const comp = shallow(<EditLibraryForm library={null} onSubmit={onSubmit} />);

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('libraries.new');
    });
});
