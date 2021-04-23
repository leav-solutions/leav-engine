// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {
    mockAttributeExtended,
    mockAttributeLink,
    mockAttributeStandard,
    mockAttributeTree
} from '../../../__mocks__/common/attribute';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import Attribute from './Attribute';

jest.mock(
    './StandardAttribute',
    () =>
        function StandardAttribute() {
            return <>StandardAttribute</>;
        }
);

jest.mock(
    './RecordLinkAttribute',
    () =>
        function RecordLinkAttribute() {
            return <>RecordLinkAttribute</>;
        }
);

jest.mock(
    './TreeLinkAttribute/TreeLinkAttribute',
    () =>
        function TreeLinkAttribute() {
            return <>TreeLinkAttribute</>;
        }
);

jest.mock(
    './ExtendedAttribute',
    () =>
        function ExtendedAttribute() {
            return <>ExtendedAttribute</>;
        }
);

describe('Attribute', () => {
    test('should call StandardAttribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Attribute
                        attribute={mockAttributeStandard}
                        depth={0}
                        path={mockAttributeStandard.id}
                        library="test_lib"
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('StandardAttribute')).toHaveLength(1);
    });

    test('should call RecordLinkAttribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <Attribute
                            attribute={mockAttributeLink}
                            depth={0}
                            path={mockAttributeLink.id}
                            library="test_lib"
                        />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('RecordLinkAttribute')).toHaveLength(1);
    });

    test('should call TreeLinkAttribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <Attribute
                            attribute={mockAttributeTree}
                            depth={0}
                            path={mockAttributeTree.id}
                            library="test_lib"
                        />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('TreeLinkAttribute')).toHaveLength(1);
    });

    test('should call ExtendedAttribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <Attribute
                            attribute={mockAttributeExtended}
                            depth={0}
                            path={mockAttributeExtended.id}
                            library="test_lib"
                        />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('ExtendedAttribute')).toHaveLength(1);
    });
});
