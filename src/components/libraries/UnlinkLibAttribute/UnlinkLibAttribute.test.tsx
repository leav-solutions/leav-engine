import {shallow} from 'enzyme';
import * as React from 'react';
import {AttributeFormat, AttributeType} from 'src/_gqlTypes/globalTypes';
import UnlinkLibAttribute from './UnlinkLibAttribute';

describe('UnlinkLibAttribute', () => {
    test('Pass down unlink function', async () => {
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
        const onUnlink = jest.fn();

        const comp = shallow(
            <UnlinkLibAttribute library={library} attribute={library.attributes[0]} onUnlink={onUnlink} />
        );

        expect(comp.find('ConfirmedButton').props().action).toBeDefined();
    });
});
