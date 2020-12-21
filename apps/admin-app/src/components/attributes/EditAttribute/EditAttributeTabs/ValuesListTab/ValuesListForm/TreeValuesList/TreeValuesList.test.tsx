// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {ITreeValuesList} from '../../../../../../../_types/attributes';
import TreeValuesList from './TreeValuesList';

jest.mock(
    '../../../../../../trees/SelectTreeNodeModal',
    () =>
        function SelectTreeNodeModal() {
            return <div>SelectTreeNodeModal</div>;
        }
);

jest.mock(
    '../../../../../../shared/RecordCard',
    () =>
        function RecordCard() {
            return <div>RecordCard</div>;
        }
);

jest.mock(
    '../../../../../../shared/TreeNodeBreadcrumb',
    () =>
        function TreeNodeBreadcrumb() {
            return <div>TreeNodeBreadcrumb</div>;
        }
);

describe('TreeValuesList', () => {
    const onValuesUpdate = jest.fn();
    const baseWhoAmI = {
        id: '132456',
        label: 'My record',
        preview: null,
        color: null,
        library: {id: 'test_lib', label: {fr: 'Test Lib'}}
    };
    const mockValues: ITreeValuesList[] = [
        {
            record: {
                whoAmI: {
                    ...baseWhoAmI,
                    id: '123456'
                }
            },
            ancestors: [
                {
                    record: {
                        whoAmI: {
                            ...baseWhoAmI,
                            id: '654321'
                        }
                    }
                },
                {
                    record: {
                        whoAmI: {
                            ...baseWhoAmI,
                            id: '987654'
                        }
                    }
                }
            ]
        },
        {
            record: {
                whoAmI: {
                    ...baseWhoAmI,
                    id: '123457'
                }
            },
            ancestors: [
                {
                    record: {
                        whoAmI: {
                            ...baseWhoAmI,
                            id: '888888'
                        }
                    }
                },
                {
                    record: {
                        whoAmI: {
                            ...baseWhoAmI,
                            id: '999999'
                        }
                    }
                }
            ]
        }
    ];

    beforeEach(jest.clearAllMocks);

    test('Render existing list', async () => {
        const comp = shallow(
            <TreeValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedTree="test_tree" />
        );

        expect(comp.find('[data-test-id="values-list-value"]')).toHaveLength(2);
    });

    test('Add new value from selection in the tree', async () => {
        const comp = shallow(
            <TreeValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedTree="test_tree" />
        );

        comp.find('[data-test-id="values-list-add-btn"]').simulate('click');

        const selectTreeNodeComp = comp.find('SelectTreeNodeModal');
        expect(selectTreeNodeComp.prop('open')).toBe(true);

        act(() => {
            const onSelectFunc: any = selectTreeNodeComp.prop('onSelect');

            if (onSelectFunc) {
                onSelectFunc({
                    node: {
                        whoAmI: {
                            ...baseWhoAmI,
                            id: '111111'
                        },
                        parents: [
                            {
                                whoAmI: {
                                    ...baseWhoAmI,
                                    id: '222222'
                                }
                            },
                            {
                                whoAmI: {
                                    ...baseWhoAmI,
                                    id: '333333'
                                }
                            }
                        ]
                    }
                });
            }
        });

        await wait(0);

        expect(onValuesUpdate).toBeCalled();
    });

    test("When selecting a tree node, don't add a node already present in values", async () => {
        const comp = shallow(
            <TreeValuesList values={mockValues} onValuesUpdate={onValuesUpdate} linkedTree="test_tree" />
        );

        comp.find('[data-test-id="values-list-add-btn"]').simulate('click');

        const selectTreeNodeComp = comp.find('SelectTreeNodeModal');
        expect(selectTreeNodeComp.prop('open')).toBe(true);

        act(() => {
            const onSelectFunc: any = selectTreeNodeComp.prop('onSelect');

            if (onSelectFunc) {
                onSelectFunc({
                    node: {
                        whoAmI: {
                            ...baseWhoAmI,
                            id: '123456'
                        },
                        parents: [
                            {
                                whoAmI: {
                                    ...baseWhoAmI,
                                    id: '654321'
                                }
                            },
                            {
                                whoAmI: {
                                    ...baseWhoAmI,
                                    id: '987654'
                                }
                            }
                        ]
                    }
                });
            }
        });

        await wait(0);

        expect(onValuesUpdate).not.toBeCalled();
    });
});
