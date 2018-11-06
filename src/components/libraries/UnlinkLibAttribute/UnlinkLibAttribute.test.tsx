import * as React from 'react';
import {create} from 'react-test-renderer';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import {Mockify} from 'src/_types/Mockify';
import UnlinkLibAttribute from './UnlinkLibAttribute';

describe('UnlinkLibAttribute', () => {
    test('Snapshot test', async () => {
        const lib: Mockify<GET_LIBRARIES_libraries> = {};
        const onUnlink = jest.fn();

        const comp = create(<UnlinkLibAttribute library={lib as GET_LIBRARIES_libraries} onUnlink={onUnlink} />);

        expect(comp).toMatchSnapshot();
    });
});
