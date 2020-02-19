import {shallow} from 'enzyme';
import React from 'react';
import {ITreeLinkElement} from '../../../_types/records';
import TreeNodeBreadcrumb from './TreeNodeBreadcrumb';

jest.mock('./PathPart', () => {
    return function PathPart({record}) {
        return <div data-test-id="tree-breadcrumb-part" />;
    };
});

describe('TreeNodeBreadcrumb', () => {
    const baseWhoAmI = {
        id: '132456',
        label: 'My record',
        preview: null,
        color: null,
        library: {id: 'test_lib', label: {fr: 'Test Lib'}}
    };

    const mockElementWithAncestors: ITreeLinkElement = {
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
            },
            {
                record: {
                    whoAmI: {
                        ...baseWhoAmI,
                        id: '123456'
                    }
                }
            }
        ]
    };

    const mockElementNoAncestors: ITreeLinkElement = {
        record: {
            whoAmI: {
                ...baseWhoAmI,
                id: '123456'
            }
        },
        ancestors: []
    };

    test('Render element with its ancestors', async () => {
        const comp = shallow(<TreeNodeBreadcrumb element={mockElementWithAncestors} />).dive();

        expect(comp.find('BreadcrumbSection')).toHaveLength(3);
    });

    test('Render element only if no ancestors', async () => {
        const comp = shallow(<TreeNodeBreadcrumb element={mockElementNoAncestors} />).dive();

        expect(comp.find('BreadcrumbSection')).toHaveLength(1);
    });
});
