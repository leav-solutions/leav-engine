import {type MockedResponse} from '@apollo/client/testing';
import {ENABLE_TREE_ATTRIBUTE_V2_FORM, ENABLE_TREE_ATTRIBUTE_V2_MODAL} from '@leav/utils';
import {vi} from 'vitest';
import {GlobalSettingsFlagsDocument} from '_ui/_gqlTypes';
import {renderHook, waitFor} from '_ui/_tests/testUtils';
import {useTreeAttributeV2Flags} from './useTreeAttributeV2Flags';

const _globalSettingsMock = (settings: Record<string, unknown> | null): MockedResponse => ({
    request: {query: GlobalSettingsFlagsDocument},
    result: {data: {globalSettings: {settings}}},
});

describe('useTreeAttributeV2Flags', () => {
    test('Exposes loading=true and false/false flags while the request is pending', async () => {
        const {result} = renderHook(() => useTreeAttributeV2Flags(), {
            mocks: [_globalSettingsMock({[ENABLE_TREE_ATTRIBUTE_V2_FORM]: true})],
        });

        expect(result.current).toEqual({loading: true, isFormV2Enabled: false, isModalV2Enabled: false});

        await waitFor(() =>
            expect(result.current).toEqual({loading: false, isFormV2Enabled: true, isModalV2Enabled: false}),
        );
    });

    test('Returns false/false when settings is empty', async () => {
        const {result} = renderHook(() => useTreeAttributeV2Flags(), {mocks: [_globalSettingsMock({})]});

        await waitFor(() =>
            expect(result.current).toEqual({loading: false, isFormV2Enabled: false, isModalV2Enabled: false}),
        );
    });

    test('Returns false/false when there are no settings at all', async () => {
        const {result} = renderHook(() => useTreeAttributeV2Flags(), {mocks: [_globalSettingsMock(null)]});

        await waitFor(() =>
            expect(result.current).toEqual({loading: false, isFormV2Enabled: false, isModalV2Enabled: false}),
        );
    });

    test('Reads each flag independently', async () => {
        const {result} = renderHook(() => useTreeAttributeV2Flags(), {
            mocks: [_globalSettingsMock({[ENABLE_TREE_ATTRIBUTE_V2_MODAL]: true})],
        });

        await waitFor(() =>
            expect(result.current).toEqual({loading: false, isFormV2Enabled: false, isModalV2Enabled: true}),
        );
    });

    test('Reads both flags when both are enabled', async () => {
        const {result} = renderHook(() => useTreeAttributeV2Flags(), {
            mocks: [
                _globalSettingsMock({
                    [ENABLE_TREE_ATTRIBUTE_V2_FORM]: true,
                    [ENABLE_TREE_ATTRIBUTE_V2_MODAL]: true,
                }),
            ],
        });

        await waitFor(() =>
            expect(result.current).toEqual({loading: false, isFormV2Enabled: true, isModalV2Enabled: true}),
        );
    });

    test('Ignores non-boolean truthy/falsy values', async () => {
        const {result} = renderHook(() => useTreeAttributeV2Flags(), {
            mocks: [
                _globalSettingsMock({
                    [ENABLE_TREE_ATTRIBUTE_V2_FORM]: 'false',
                    [ENABLE_TREE_ATTRIBUTE_V2_MODAL]: 0,
                }),
            ],
        });

        // 'false' is a non-empty string, hence truthy: activating a flag is an explicit admin action
        // on the JSON, we only coerce to boolean and do not try to parse it.
        await waitFor(() =>
            expect(result.current).toEqual({loading: false, isFormV2Enabled: true, isModalV2Enabled: false}),
        );
    });

    test('Triggers a single request even when called several times', async () => {
        const resultFn = vi.fn(() => ({
            data: {globalSettings: {settings: {[ENABLE_TREE_ATTRIBUTE_V2_MODAL]: true}}},
        }));

        const {result} = renderHook(
            () => ({
                first: useTreeAttributeV2Flags(),
                second: useTreeAttributeV2Flags(),
                third: useTreeAttributeV2Flags(),
            }),
            {mocks: [{request: {query: GlobalSettingsFlagsDocument}, result: resultFn}]},
        );

        await waitFor(() => expect(result.current.first.isModalV2Enabled).toBe(true));
        expect(result.current.second.isModalV2Enabled).toBe(true);
        expect(result.current.third.isModalV2Enabled).toBe(true);
        expect(resultFn).toHaveBeenCalledTimes(1);
    });
});
