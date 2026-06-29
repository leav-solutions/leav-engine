import {PermissionTypes, PermissionsActions, useIsAllowedQuery} from '../../../../../__generated__';

/**
 * Whether the current user may manage the views of `libraryId`: rename/save/delete and (un)share
 * another user's SHARED view, configure the library's reference view, and edit the available
 * attributes. Backed by the library-scoped `manage_views` permission (admin-only by default,
 * configurable per user group in the library Permissions tab) — replaces the former admin-group check.
 *
 * Resolves to `false` while loading and when no library is targeted; the back-end remains the
 * authoritative gate (it re-checks the same permission on every mutation).
 */
export const useCanManageViews = (libraryId?: string): boolean => {
    const {data} = useIsAllowedQuery({
        variables: {
            type: PermissionTypes.library,
            applyTo: libraryId,
            actions: [PermissionsActions.manage_views],
        },
        skip: !libraryId,
        fetchPolicy: 'cache-and-network',
    });

    return data?.isAllowed?.find(permission => permission.name === PermissionsActions.manage_views)?.allowed ?? false;
};
