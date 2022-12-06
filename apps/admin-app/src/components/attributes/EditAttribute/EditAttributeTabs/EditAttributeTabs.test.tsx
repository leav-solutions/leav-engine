// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen, within} from '_tests/testUtils';
import {mockAttrAdv, mockAttrSimple} from '../../../../__mocks__/attributes';
import EditAttributeTabs from './EditAttributeTabs';

jest.mock('../../../../utils/utils', () => ({
    localizedLabel: jest.fn().mockImplementation(l => l.fr)
}));

jest.mock('../../../../hooks/useLang');

jest.mock('./ActionsListTab', () => {
    return function ActionsListTab() {
        return <div>ActionsListTab</div>;
    };
});
jest.mock('./EmbeddedFieldsTab', () => {
    return function EmbeddedFieldsTab() {
        return <div>EmbeddedFieldsTab</div>;
    };
});
jest.mock('./InfosTab', () => {
    return function InfosTab() {
        return <div>InfosTab</div>;
    };
});
jest.mock('./MetadataTab', () => {
    return function MetadataTab() {
        return <div>MetadataTab</div>;
    };
});
jest.mock('./PermissionsTab', () => {
    return function PermissionsTab() {
        return <div>PermissionsTab</div>;
    };
});
jest.mock('./ValuesListTab', () => {
    return function ValuesListTab() {
        return <div>ValuesListTab</div>;
    };
});

describe('EditAttributeTabs', () => {
    const mockAttribute = {...mockAttrSimple};

    describe('Header', () => {
        test('Display header with attribute label', async () => {
            render(<EditAttributeTabs attribute={mockAttribute} />);

            const header = screen.getByTestId('header');

            expect(within(header).getByText('Mon Attribut')).toBeInTheDocument();
        });

        test('Display header for new attribute', async () => {
            render(<EditAttributeTabs attribute={null} />);

            const header = screen.getByTestId('header');

            expect(within(header).getByText('attributes.new')).toBeInTheDocument();
        });
    });

    describe('Tabs', () => {
        test('If attribute is not new, display all tabs', async () => {
            render(<EditAttributeTabs attribute={mockAttribute} />);

            expect(screen.getByText(/informations/)).toBeInTheDocument();
            expect(screen.queryByText(/metadata/)).not.toBeInTheDocument();
            expect(screen.getByText(/values_list/)).toBeInTheDocument();
            expect(screen.getByText(/permissions/)).toBeInTheDocument();
            expect(screen.getByText(/action_list/)).toBeInTheDocument();
        });

        test('If attribute is new, display only infos tab', async () => {
            render(<EditAttributeTabs />);

            expect(screen.getByText(/informations/)).toBeInTheDocument();
            expect(screen.queryByText(/values_list/)).not.toBeInTheDocument();
            expect(screen.queryByText(/permissions/)).not.toBeInTheDocument();
            expect(screen.queryByText(/action_list/)).not.toBeInTheDocument();
        });

        test('Show metadata tab for advanced attribute', async () => {
            render(<EditAttributeTabs attribute={{...mockAttrAdv}} />);

            expect(screen.getByText(/metadata/)).toBeInTheDocument();
        });

        test('should open the tab in anchor', async () => {
            render(<EditAttributeTabs attribute={{...mockAttrAdv}} />, {
                routerProps: {
                    initialEntries: ['/attributes/edit/' + mockAttrAdv.id + '#permissions']
                }
            });

            expect(screen.getByText(/PermissionsTab/)).toBeInTheDocument();
        });
    });
});
