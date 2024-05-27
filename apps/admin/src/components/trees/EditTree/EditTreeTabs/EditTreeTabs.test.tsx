// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockTree} from '../../../../__mocks__/trees';
import EditTreeTabs from './EditTreeTabs';

jest.mock('../../../../hooks/useLang');

jest.mock('./InfosTab', () => function TreeInfosTab() {
        return <div>TreeInfosTab</div>;
    });

jest.mock('./PermissionsTab', () => function TreePermissionsTab() {
        return <div>TreePermissionsTab</div>;
    });

jest.mock('./TreeStructure', () => function TreeStructure() {
        return <div>TreeStructure</div>;
    });

jest.mock('components/trees/TreeExplorer', () => function TreeExplorer() {
        return <div>TreeExplorer</div>;
    });

describe('EditTreeTabs', () => {
    test('Render test', async () => {
        render(<EditTreeTabs tree={mockTree} readonly={false} />);

        expect(screen.getByText(mockTree.label.fr)).toBeInTheDocument();
        expect(screen.getByText('trees.informations')).toBeInTheDocument();
        expect(screen.getByText('trees.structure')).toBeInTheDocument();
        expect(screen.getByText('trees.explorer')).toBeInTheDocument();
        expect(screen.getByText('trees.permissions')).toBeInTheDocument();
    });
});
