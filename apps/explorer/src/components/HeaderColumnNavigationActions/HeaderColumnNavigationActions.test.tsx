// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import {MockStateNavigation} from '../../__mocks__/Navigation/mockState';
import HeaderColumnNavigationActions from './HeaderColumnNavigationActions';

jest.mock(
    './DefaultActions',
    () =>
        function DefaultActions() {
            return <div>DefaultActions</div>;
        }
);

jest.mock(
    './DetailActions',
    () =>
        function DetailActions() {
            return <div>DetailActions</div>;
        }
);

jest.mock(
    './SelectionActions',
    () =>
        function SelectionActions() {
            return <div>SelectionActions</div>;
        }
);

describe('HeaderColumnNavigationActions', () => {
    const path = [
        {id: 'parentId', label: 'parentLabel', library: 'parentLib'},
        {id: 'childId', label: 'childLabel', library: 'childLib'}
    ];

    test('should call actions', async () => {
        await act(async () => {
            render(
                <MockedProviderWithFragments>
                    <MockStateNavigation stateNavigation={{path}}>
                        <HeaderColumnNavigationActions depth={1} />
                    </MockStateNavigation>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getByText('DefaultActions')).toBeInTheDocument();
        expect(screen.getByText('DetailActions')).toBeInTheDocument();
        expect(screen.getByText('SelectionActions')).toBeInTheDocument();
    });
});
