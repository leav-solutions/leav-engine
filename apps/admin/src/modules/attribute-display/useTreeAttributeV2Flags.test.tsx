import {ENABLE_TREE_ATTRIBUTE_V2_FORM, ENABLE_TREE_ATTRIBUTE_V2_MODAL} from '@leav/utils';
import {renderHook} from '@testing-library/react';
import {type PropsWithChildren} from 'react';
import {TestProviders} from '../../_tests/TestProviders';
import {useTreeAttributeV2Flags} from './useTreeAttributeV2Flags';

const _renderFlags = (settings?: Record<string, unknown>) =>
    renderHook(() => useTreeAttributeV2Flags(), {
        wrapper: ({children}: PropsWithChildren) => (
            <TestProviders globalSettings={{defaultApp: 'admin', name: 'My App', icon: null, favicon: null, settings}}>
                {children}
            </TestProviders>
        ),
    });

describe('useTreeAttributeV2Flags', () => {
    test('Both flags are off without any global settings', () => {
        const {result} = _renderFlags();

        expect(result.current).toEqual({isFormV2Enabled: false, isModalV2Enabled: false});
    });

    test('Read each flag independently', () => {
        expect(_renderFlags({[ENABLE_TREE_ATTRIBUTE_V2_FORM]: true}).result.current).toEqual({
            isFormV2Enabled: true,
            isModalV2Enabled: false,
        });

        expect(_renderFlags({[ENABLE_TREE_ATTRIBUTE_V2_MODAL]: true}).result.current).toEqual({
            isFormV2Enabled: false,
            isModalV2Enabled: true,
        });

        expect(
            _renderFlags({[ENABLE_TREE_ATTRIBUTE_V2_FORM]: true, [ENABLE_TREE_ATTRIBUTE_V2_MODAL]: true}).result
                .current,
        ).toEqual({isFormV2Enabled: true, isModalV2Enabled: true});
    });

    test('Ignores non-boolean truthy/falsy values', () => {
        // 'false' is a non-empty string, hence truthy: activating a flag is an explicit admin action
        // on the JSON, we only coerce to boolean and do not try to parse it.
        expect(
            _renderFlags({[ENABLE_TREE_ATTRIBUTE_V2_FORM]: 0, [ENABLE_TREE_ATTRIBUTE_V2_MODAL]: 'false'}).result
                .current,
        ).toEqual({isFormV2Enabled: false, isModalV2Enabled: true});
    });
});
