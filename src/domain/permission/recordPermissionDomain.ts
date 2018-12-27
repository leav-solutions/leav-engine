import {IValueRepo} from 'infra/value/valueRepo';
import {LibraryPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IPermissionDomain} from './permissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

export interface IRecordPermissionDomain {
    getRecordPermission(action: string, userId: number, recordLibrary: string, recordId: number): Promise<boolean>;
}

export default function(
    permissionDomain: IPermissionDomain,
    treePermissionDomain: ITreePermissionDomain,
    libraryDomain: ILibraryDomain,
    attributeDomain: IAttributeDomain,
    valueRepo: IValueRepo
): IRecordPermissionDomain {
    return {
        async getRecordPermission(
            action: RecordPermissionsActions,
            userId: number,
            recordLibrary: string,
            recordId: number
        ): Promise<boolean> {
            const lib = await libraryDomain.getLibraryProperties(recordLibrary);
            if (typeof lib.permissionsConf === 'undefined') {
                // Check if action is present in library permissions
                const isLibAction = Object.values(LibraryPermissionsActions).indexOf(action) !== -1;

                return isLibAction
                    ? permissionDomain.getLibraryPermission(
                          (action as unknown) as LibraryPermissionsActions,
                          recordLibrary,
                          userId
                      )
                    : permissionDomain.getDefaultPermission();
            }

            const treesAttrValues = await Promise.all(
                lib.permissionsConf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties(permTreeAttr);
                    return valueRepo.getValues(recordLibrary, recordId, permTreeAttrProps);
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[lib.permissionsConf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = await treePermissionDomain.getTreePermission({
                type: PermissionTypes.RECORD,
                action,
                userId,
                applyTo: recordLibrary,
                treeValues: valuesByAttr,
                permissionsConf: lib.permissionsConf,
                getDefaultPermission: permissionDomain.getLibraryPermission
            });

            return perm;
        }
    };
}
