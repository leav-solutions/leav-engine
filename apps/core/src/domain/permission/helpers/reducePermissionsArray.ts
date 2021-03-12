// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IReducePermissionsArrayHelper {
    reducePermissionsArray: (permissions: Array<boolean | null>) => boolean | null;
}

export default function (): IReducePermissionsArrayHelper {
    return {
        /**
         * Compute permissions out of an array. Looks for something different than null somewhere,
         * but keeps null if everything is null.
         * In case of true/false conflict, TRUE wins.
         *
         * @param permissions
         */
        reducePermissionsArray: permissions =>
            permissions.reduce((globalPerm, valuePerm) => {
                if (globalPerm === null) {
                    return valuePerm;
                }

                if (valuePerm !== null) {
                    return globalPerm || valuePerm;
                }

                return globalPerm;
            }, null)
    };
}
