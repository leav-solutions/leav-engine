import {render} from 'enzyme';
import React from 'react';
import {ITreeLinkValue} from '../../../../../../../_types/records';
import EditRecordFormLinksTreeElement from './EditRecordFormLinksTreeElement';

jest.mock('./PathPart', () => {
    return function PathPart({record, deletable}) {
        return <div data-test-id={`path_part_${record.id}_${!!deletable}`} />;
    };
});

describe('EditRecordFormLinksTreeElement', () => {
    const value: ITreeLinkValue = {
        id_value: '98765',
        value: {
            record: {
                whoAmI: {
                    id: '1',
                    library: {
                        id: 'test_lib',
                        label: {
                            fr: 'Test Lib'
                        }
                    },
                    label: 'TestLabel',
                    color: null,
                    preview: null
                }
            },
            ancestors: [
                {
                    record: {
                        whoAmI: {
                            id: '2',
                            library: {
                                id: 'test_lib',
                                label: {
                                    fr: 'Test Lib'
                                }
                            },
                            label: 'TestLabel2',
                            color: null,
                            preview: null
                        }
                    }
                },
                {
                    record: {
                        whoAmI: {
                            id: '1',
                            library: {
                                id: 'test_lib',
                                label: {
                                    fr: 'Test Lib'
                                }
                            },
                            label: 'TestLabel',
                            color: null,
                            preview: null
                        }
                    }
                }
            ]
        },
        raw_value: null,
        modified_at: 1234567890,
        created_at: 1234567890,
        version: null
    };
    test('Display value and its ancestors', async () => {
        const onDelete = jest.fn();
        const comp = render(<EditRecordFormLinksTreeElement value={value} onDeleteLink={onDelete} />);

        expect(comp.find('[data-test-id="path_part_1_true"]')).toHaveLength(1);
        expect(comp.find('[data-test-id="path_part_2_false"]')).toHaveLength(1);
    });
});
