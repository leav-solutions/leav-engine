import {render} from 'enzyme';
import {History} from 'history';
import React from 'react';
import {Mockify} from '../../../../_types/Mockify';
import {mockTree} from '../../../../__mocks__/trees';
import EditTreeTabs from './EditTreeTabs';

jest.mock('../../../../hooks/useLang');

jest.mock('./InfosTab', () => {
    return function TreeInfosTab() {
        return <div>TreeInfosTab</div>;
    };
});

jest.mock('./StructureTab', () => {
    return function StructureTab() {
        return <div>StructureTab</div>;
    };
});

describe('EditTreeTabs', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const comp = render(<EditTreeTabs tree={mockTree} readonly={false} history={mockHistory as History} />);

        expect(comp).toMatchSnapshot();
    });
});
