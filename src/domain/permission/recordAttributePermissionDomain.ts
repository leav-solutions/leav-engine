import {IValueRepo} from 'infra/value/valueRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionTypes, RecordAttributePermissionsActions} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import getDefaultPermission from './helpers/getDefaultPermission';
import {IPermissionDomain} from './permissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

export interface IRecordAttributePermissionDomain {
    getRecordAttributePermission(
        action: RecordAttributePermissionsActions,
        userGroupId: string,
        attributeId: string,
        recordLibrary: string,
        recordId: string,
        ctx: IQueryInfos
    ): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.permission.tree'?: ITreePermissionDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
    config?: IConfig;
}

export default function({
    'core.domain.permission.tree': treePermissionDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.infra.value': valueRepo = null,
    config = null
}: IDeps = {}): IRecordAttributePermissionDomain {
    return {
        async getRecordAttributePermission(
            action: RecordAttributePermissionsActions,
            userId: string,
            attributeId: string,
            recordLibrary: string,
            recordId: string,
            ctx: IQueryInfos
        ): Promise<boolean> {
            const attrProps = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
            if (typeof attrProps.permissions_conf === 'undefined') {
                return getDefaultPermission(config);
            }

            const treesAttrValues = await Promise.all(
                attrProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps,
                        ctx
                    });
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[attrProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = treePermissionDomain.getTreePermission(
                {
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action,
                    userId,
                    applyTo: attributeId,
                    treeValues: valuesByAttr,
                    permissions_conf: attrProps.permissions_conf,
                    getDefaultPermission: () => getDefaultPermission(config)
                },
                ctx
            );

            return perm;
        }
    };
}
