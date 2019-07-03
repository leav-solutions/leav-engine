import {mount} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
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
                        trees: [
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
        ];

        const comp = mount(
            <MockedProvider mocks={mocks}>
                <TreesSelector />
            </MockedProvider>
        );

        await sleep(0);
        comp.update();

        expect(comp.find('TreesSelectorField')).toHaveLength(1);
        expect(comp.find('TreesSelectorField').prop('trees')).toHaveLength(1);
        expect(comp.contains('TestTree')).toBe(true);
    });
});
