import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {useAttributeInformations} from './useAttributeInformations';
import {renderHook} from '@testing-library/react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type RecordFormAttributeFragment} from '_ui/_gqlTypes';

jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn(),
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
                value: 'attributes.format_extended',
            },
        ]);
    });

    it('should return description on the correct language if set on attribute', () => {
        const {result} = renderHook(() => useAttributeInformations(mockFormAttribute));

        expect(result.current).toEqual([
            {
                title: 'record_summary.attribute_format',
                value: 'attributes.format_extended',
            },
            {
                title: 'record_summary.descriptive',
                value: 'Mon attribut',
            },
        ]);
    });
});
