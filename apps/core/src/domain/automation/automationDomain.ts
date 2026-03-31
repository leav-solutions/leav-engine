// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {systemUserId} from '../../_constants/users';
import {type IAutomationRule} from '../../_types/automation';
import {type IList} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import PermissionError from '../../errors/PermissionError';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';

interface IGetAutomationRulesParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        created_at?: number;
        created_by?: string;
        modified_at?: number;
        modified_by?: string;
    };
}

export interface IAutomationDomain {
    getAutomationRules({
        params,
        ctx,
    }: {
        params: IGetAutomationRulesParams;
        ctx: IQueryInfos;
    }): Promise<IList<IAutomationRule>>;
}

export interface IAutomationDomainDeps {
    'core.domain.permission.admin': IAdminPermissionDomain;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain,
}: IAutomationDomainDeps): IAutomationDomain {
    // Temporary fake data, to illustrate how to implement the getAutomationRules method,
    // and to be able to implement the frontend part before having the real implementation of this method, which will be done in a later step.
    const nbRules = 2;
    const fakeRules: IAutomationRule[] = [];
    for (let i = 0; i < nbRules; i++) {
        fakeRules.push({
            id: `${i}`,
            label: {en: `Fake rule ${i}`},
            description: {
                en: `This is a fake rule ${i}, just to illustrate how to implement the getAutomationRules method`,
            },
            createdAt: 1774878104 - i * 100,
            createdBy: systemUserId,
            modifiedAt: 1774878104 - i * 100,
            modifiedBy: systemUserId,
        });
    }

    return {
        async getAutomationRules({params, ctx}) {
            const hasAdminAccessPermission = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.MANAGE_AUTOMATION,
                ctx,
            });
            if (!hasAdminAccessPermission) {
                throw new PermissionError(AdminPermissionsActions.MANAGE_AUTOMATION);
            }

            return {
                totalCount: fakeRules.length,
                list: fakeRules,
            };
        },
    };
}
