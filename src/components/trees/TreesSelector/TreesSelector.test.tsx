import {MockedProvider} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-test-renderer';
import sleep from 'sleep-promise';
import TreesSelector from '.';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';

describe('TreesSelector', () => {
    test('Snapshot test', async () => {
        const mocks = [
            {
                request: {
                    query: getTreesQuery
                },
                result: {
                    data: {
                        trees: {
                            __typename: 'TreesList',
                            totalCount: 1,
                            list: [
                                {
                                    __typename: 'Tree',
                                    id: 'test_tree',
                                    system: false,
                                    label: {
                                        en: 'TestTree',
                                        fr: 'TestTree'
                                    },
                                    libraries: ['test_lib']
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp;
        act(() => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <TreesSelector />
                </MockedProvider>
            );
        });

        await sleep(0);
        comp.update();

        expect(comp.find('TreesSelectorField')).toHaveLength(1);
        expect(comp.find('TreesSelectorField').prop('trees')).toHaveLength(1);
        expect(comp.contains('TestTree')).toBe(true);
    });
});
