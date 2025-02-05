// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {useAttributeInformations} from './useAttributeInformations';
import {renderHook} from '@testing-library/react-hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';

jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn()
}));

jest.mock('_ui/hooks/useLang');

describe('useAttributeInformations', () => {
    beforeEach(() => {
        (useSharedTranslation as jest.Mock).mockReturnValue({t: jest.fn(key => key)});
    });

    it('should return empty array by default', () => {
        const {result} = renderHook(() => useAttributeInformations({} as RecordFormAttributeFragment));

        expect(result.current).toEqual([]);
    });

    it('should return format if set on attribute', () => {
        const {result} = renderHook(() => useAttributeInformations({...mockFormAttribute, description: null}));

        expect(result.current).toEqual([
            {
                title: 'record_summary.attribute_format',
                value: mockFormAttribute.format
            }
        ]);
    });

    it('should return description on the correct language if set on attribute', () => {
        const {result} = renderHook(() => useAttributeInformations(mockFormAttribute));

        expect(result.current).toEqual([
            {
                title: 'record_summary.attribute_format',
                value: mockFormAttribute.format
            },
            {
                title: 'record_summary.descriptive',
                value: 'Mon attribut'
            }
        ]);
    });
});
