import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {Mockify} from '../../../../../_types/Mockify';
import {mockTree} from '../../../../../__mocks__/trees';
import InfosTab from './InfosTab';

jest.mock('../../../../../hooks/useLang');

jest.mock('./InfosForm', () => {
    return function TreeInfosForm() {
        return <div>TreeInfosForm</div>;
    };
});

describe('InfosTab', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const comp = render(<InfosTab tree={mockTree} readonly={false} history={mockHistory as History} />);

        expect(comp).toMatchSnapshot();
    });
});
