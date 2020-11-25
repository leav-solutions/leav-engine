import {render} from 'enzyme';
import React from 'react';
import {mockTree} from '../../../../../__mocks__/trees';
import PermissionsTab from './PermissionsTab';

jest.mock('./PermissionsContent', () => {
    return function PermissionsContent() {
        return <div>PermissionsContent</div>;
    };
});

describe('PermissionsTab', () => {
    test('Snapshot test', async () => {
        const comp = render(<PermissionsTab tree={{...mockTree}} readonly={false} />);

        expect(comp).toMatchSnapshot();
    });
});
