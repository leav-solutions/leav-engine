// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TypeGuards} from './typeGuards';
import {mockRecord} from '_ui/__mocks__/common/record';

const mockRecordIdentity = {
    id: '123456',
    whoAmI: {
        ...mockRecord,
        id: '123456',
        label: 'Record label A',
        library: {
            ...mockRecord.library,
            id: 'linked_lib',
            label: {en: 'Linked lib'}
        }
    }
};

const mockValue = {
    value: 'toto',
    created_at: 123456789,
    modified_at: 123456789,
    id_value: null,
    metadata: null,
    version: null
};

const mockLinkValue = {
    linkValue: {
        id: '123456',
        whoAmI: {
            ...mockRecord
        }
    },
    created_at: 123456789,
    modified_at: 123456789,
    id_value: null,
    metadata: null,
    version: null
};

const mockTreeValue = {
    treeValue: {
        id: '123456',
        record: mockRecordIdentity,
        ancestors: [
            {
                record: mockRecordIdentity
            },
            {
                record: mockRecordIdentity
            }
        ]
    },
    created_at: 123456789,
    modified_at: 123456789,
    metadata: null,
    id_value: '123456'
};

describe('typeGuards', () => {
    describe('isSimpleCellValues', () => {
        it('should be false', () => {
            expect(TypeGuards.isSimpleCellValues([])).toBe(false);
            expect(TypeGuards.isSimpleCellValues([{}])).toBe(false);
            expect(TypeGuards.isSimpleCellValues([{...mockLinkValue, isInherited: true}])).toBe(false);
            expect(TypeGuards.isSimpleCellValues([{...mockTreeValue, isInherited: true}])).toBe(false);
        });

        it('should be true', () => {
            expect(TypeGuards.isSimpleCellValues([{...mockValue}])).toBe(true);
            expect(TypeGuards.isSimpleCellValues([{...mockValue, isInherited: false}])).toBe(true);
            expect(TypeGuards.isSimpleCellValues([{...mockValue, isInherited: true}])).toBe(true);
        });
    });

    describe('isLinkCellValue', () => {
        it('should be false', () => {
            expect(TypeGuards.isLinkCellValue({})).toBe(false);
            expect(TypeGuards.isLinkCellValue({...mockValue, isInherited: true})).toBe(false);
            expect(TypeGuards.isLinkCellValue({...mockTreeValue, isInherited: true})).toBe(false);
        });

        it('should be true', () => {
            expect(TypeGuards.isLinkCellValue({...mockLinkValue})).toBe(true);
            expect(TypeGuards.isLinkCellValue({...mockLinkValue, isInherited: false})).toBe(true);
            expect(TypeGuards.isLinkCellValue({...mockLinkValue, isInherited: true})).toBe(true);
        });
    });

    describe('isLinkCellValues', () => {
        it('should be false', () => {
            expect(TypeGuards.isLinkCellValues([])).toBe(false);
            expect(TypeGuards.isLinkCellValues([{}])).toBe(false);
            expect(TypeGuards.isLinkCellValues([{...mockValue, isInherited: true}])).toBe(false);
            expect(TypeGuards.isLinkCellValues([{...mockTreeValue, isInherited: true}])).toBe(false);
        });

        it('should be true', () => {
            expect(TypeGuards.isLinkCellValues([{...mockLinkValue}])).toBe(true);
            expect(TypeGuards.isLinkCellValues([{...mockLinkValue, isInherited: false}])).toBe(true);
            expect(TypeGuards.isLinkCellValues([{...mockLinkValue, isInherited: true}])).toBe(true);
        });
    });

    describe('isTreeCellValue', () => {
        it('should be false', () => {
            expect(TypeGuards.isTreeCellValue({})).toBe(false);
            expect(TypeGuards.isTreeCellValue({...mockValue, isInherited: true})).toBe(false);
            expect(TypeGuards.isTreeCellValue({...mockLinkValue, isInherited: true})).toBe(false);
        });

        it('should be true', () => {
            expect(TypeGuards.isTreeCellValue({...mockTreeValue})).toBe(true);
            expect(TypeGuards.isTreeCellValue({...mockTreeValue, isInherited: false})).toBe(true);
            expect(TypeGuards.isTreeCellValue({...mockTreeValue, isInherited: true})).toBe(true);
        });
    });

    describe('isTreeCellValues', () => {
        it('should be false', () => {
            expect(TypeGuards.isTreeCellValues([])).toBe(false);
            expect(TypeGuards.isTreeCellValues([{}])).toBe(false);
            expect(TypeGuards.isTreeCellValues([{...mockValue, isInherited: true}])).toBe(false);
            expect(TypeGuards.isTreeCellValues([{...mockLinkValue, isInherited: true}])).toBe(false);
        });

        it('should be true', () => {
            expect(TypeGuards.isTreeCellValues([{...mockTreeValue}])).toBe(true);
            expect(TypeGuards.isTreeCellValues([{...mockTreeValue, isInherited: false}])).toBe(true);
            expect(TypeGuards.isTreeCellValues([{...mockTreeValue, isInherited: true}])).toBe(true);
        });
    });
});
