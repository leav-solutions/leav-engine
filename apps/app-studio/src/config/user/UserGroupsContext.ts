import {createContext, useContext} from 'react';

/**
 * Ids of the user groups the connected user belongs to (from `getUserIdentity`).
 * Exposed locally to app-studio (the public `@leav/ui` UserContext stays unchanged) so admin
 * detection can be derived without an extra GraphQL query — see {@link useIsAdminUser}.
 */
const UserGroupsContext = createContext<string[]>([]);

export const UserGroupsProvider = UserGroupsContext.Provider;

export const useUserGroups = (): string[] => useContext(UserGroupsContext);
