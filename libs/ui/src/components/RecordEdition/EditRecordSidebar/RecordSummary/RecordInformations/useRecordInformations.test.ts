// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useRecordInformations} from './useRecordInformations';
import {renderHook} from '@testing-library/react-hooks';
import {mockRecord} from '_ui/__mocks__/common/record';
import {GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn()
}));

describe('useRecordInformations', () => {
    beforeEach(() => {
        (useSharedTranslation as jest.Mock).mockReturnValue({t: jest.fn(key => key)});
    });

    it('should return record id', () => {
        const recordData = {};

        const {result} = renderHook(() =>
            useRecordInformations(mockRecord, recordData as GetRecordColumnsValuesRecord)
        );

        expect(result.current).toEqual([
            {
                title: 'record_summary.id_entity',
                value: mockRecord.id
            }
        ]);
    });

    it('should return empty record id when record is null', () => {
        const {result} = renderHook(() => useRecordInformations(null, null));

        expect(result.current).toEqual([
            {
                title: 'record_summary.id_entity',
                value: '-'
            }
        ]);
    });

    it('should return record creation when recordData has creation data', () => {
        const recordData = {
            created_at: [{payload: '2021-01-01'}],
            created_by: [{linkValue: {whoAmI: {label: 'User1'}}}]
        };

        const {result} = renderHook(() =>
            useRecordInformations(mockRecord, recordData as unknown as GetRecordColumnsValuesRecord)
        );

        expect(result.current).toEqual([
            {
                title: 'record_summary.id_entity',
                value: mockRecord.id
            },
            {
                title: 'record_summary.creation',
                value: 'record_summary.date_by_user'
            }
        ]);
    });

    it('should return record last modification when recordData has last modification data', () => {
        const recordData = {
            modified_at: [{payload: '2021-01-02'}],
            modified_by: [{linkValue: {whoAmI: {label: 'User2'}}}]
        };

        const {result} = renderHook(() =>
            useRecordInformations(mockRecord, recordData as unknown as GetRecordColumnsValuesRecord)
        );

        expect(result.current).toEqual([
            {
                title: 'record_summary.id_entity',
                value: mockRecord.id
            },
            {
                title: 'record_summary.last_modification',
                value: 'record_summary.date_by_user'
            }
        ]);
    });
});
