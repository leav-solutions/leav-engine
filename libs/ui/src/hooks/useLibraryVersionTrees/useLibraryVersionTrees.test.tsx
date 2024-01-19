// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {mockVersionProfile} from '_ui/__mocks__/common/versionProfile';
import useLibraryVersionTrees from '.';
import {getVersionableAttributesByLibraryQuery} from '../../_queries/attributes/getVersionableAttributesByLibrary';
import {renderHook, waitFor} from '../../_tests/testUtils';

describe('useLibraryVersionTrees', () => {
    test("Return deduped list of trees usable in versions by library's attributes", async () => {
        const mockSimpleTree = {
            id: 'my_tree',
            label: {
                fr: 'Mon arbre',
                en: 'My tree'
            }
        };

        const mockSimpleTree2 = {
            id: 'my_tree2',
            label: {
                fr: 'Mon arbre 2',
                en: 'My tree 2'
            }
        };

        const mockProfileBase = {
            ...mockVersionProfile,
            trees: [mockSimpleTree]
        };

        const mocks = [
            {
                request: {
                    query: getVersionableAttributesByLibraryQuery,
                    variables: {libraryId: 'my_lib'}
                },
                result: {
                    data: {
                        attributes: {
                            list: [
                                {
                                    ...mockAttributeSimple,
                                    id: 'attrA',
                                    versions_conf: {
                                        versionable: true,
                                        profile: {
                                            ...mockProfileBase,
                                            id: 'profileA'
                                        }
                                    }
                                },
                                {
                                    ...mockAttributeSimple,
                                    id: 'attrB',
                                    versions_conf: {
                                        versionable: true,
                                        profile: {
                                            ...mockProfileBase,
                                            id: 'profileA'
                                        }
                                    }
                                },
                                {
                                    ...mockAttributeSimple,
                                    id: 'attrC',
                                    versions_conf: {
                                        versionable: true,
                                        profile: {
                                            ...mockProfileBase,
                                            id: 'profileB',
                                            trees: [mockSimpleTree2]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useLibraryVersionTrees('my_lib'), {
            wrapper: ({children}) => <MockedProvider mocks={mocks}>{children as JSX.Element}</MockedProvider>
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeUndefined();
        expect(result.current.trees).toEqual([mockSimpleTree, mockSimpleTree2]);
    });
});
