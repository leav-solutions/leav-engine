// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '@testing-library/react';
import {TestProviders} from '_tests/TestProviders';
import {useGetNavigationMenuItems} from './useGetNavigationMenuItems';

const ALL_ADMIN_PERMISSIONS = {
    admin_access_libraries: true,
    admin_access_attributes: true,
    admin_access_trees: true,
    admin_access_applications: true,
    admin_access_version_profiles: true,
    admin_access_tasks: true,
    admin_access_logs: true,
};

const NO_PERMISSIONS = Object.fromEntries(Object.keys(ALL_ADMIN_PERMISSIONS).map(key => [key, false]));

const wrapper =
    (userPermissions?: {[key: string]: boolean}) =>
    ({children}: {children: React.ReactNode}) => (
        <TestProviders userPermissions={userPermissions}>{children as React.ReactElement}</TestProviders>
    );

describe('useGetNavigationMenuItems', () => {
    test('Returns all items when all permissions are granted', () => {
        const {result} = renderHook(() => useGetNavigationMenuItems(), {
            wrapper: wrapper(ALL_ADMIN_PERMISSIONS),
        });

        expect(result.current).toHaveLength(8);
        expect(result.current.map(item => item.key)).toContain('general');
        expect(result.current.map(item => item.key)).toContain('libraries');
    });

    test('Returns only general when all permissions are false', () => {
        const {result} = renderHook(() => useGetNavigationMenuItems(), {
            wrapper: wrapper(NO_PERMISSIONS),
        });

        expect(result.current).toHaveLength(1);
        expect(result.current[0].key).toBe('general');
    });

    test('Returns general and libraries when only admin_access_libraries is true', () => {
        const {result} = renderHook(() => useGetNavigationMenuItems(), {
            wrapper: wrapper({...NO_PERMISSIONS, admin_access_libraries: true}),
        });

        expect(result.current).toHaveLength(2);
        expect(result.current.map(item => item.key)).toEqual(['general', 'libraries']);
    });
});
