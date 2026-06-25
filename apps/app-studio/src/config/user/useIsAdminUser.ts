import {useUserGroups} from './UserGroupsContext';

/**
 * Id of the well-known administrators group created out-of-the-box by core at startup
 * (mirrors `adminsGroupId` in `apps/core/src/_constants/systemRecords.ts`). A user belonging to
 * this group is considered a global admin of the application.
 */
const ADMIN_GROUP_ID = '1';

/**
 * Whether the connected user is an application admin, i.e. a member of the administrators group.
 * Global (not per-library): an admin can configure the reference view of every library.
 */
export const useIsAdminUser = (): boolean => {
    const groups = useUserGroups();
    return groups.includes(ADMIN_GROUP_ID);
};
