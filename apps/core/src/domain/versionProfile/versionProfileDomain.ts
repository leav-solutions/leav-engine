// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {i18n} from 'i18next';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IVersionProfileRepo} from 'infra/versionProfile/versionProfileRepo';
import {IUtils} from 'utils/utils';
import {IAttribute} from '_types/attribute';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreVersionProfileParams, IVersionProfile} from '_types/versionProfile';
import PermissionError from '../../errors/PermissionError';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';

export interface IVersionProfileDomain {
    getVersionProfiles(params: {
        params?: IGetCoreVersionProfileParams;
        ctx: IQueryInfos;
    }): Promise<IList<IVersionProfile>>;
    getVersionProfileProperties(params: {id: string; ctx: IQueryInfos}): Promise<IVersionProfile>;
    saveVersionProfile(params: {versionProfile: IVersionProfile; ctx: IQueryInfos}): Promise<IVersionProfile>;
    deleteVersionProfile(params: {id: string; ctx: IQueryInfos}): Promise<IVersionProfile>;
    getAttributesUsingProfile(params: {id: string; ctx: IQueryInfos}): Promise<IAttribute[]>;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.infra.versionProfile'?: IVersionProfileRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.attribute'?: IAttributeRepo;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain,
    'core.infra.versionProfile': versionProfileRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.attribute': attributeRepo = null,
    'core.utils': utils = null,
    translator = null
}: IDeps): IVersionProfileDomain {
    return {
        async getVersionProfiles({params, ctx}) {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return versionProfileRepo.getVersionProfiles({params: initializedParams, ctx});
        },
        async getVersionProfileProperties({id, ctx}) {
            const searchParams: IGetCoreVersionProfileParams = {
                filters: {id}
            };

            const profile = await versionProfileRepo.getVersionProfiles({params: searchParams, ctx});

            if (!profile.list.length) {
                throw utils.generateExplicitValidationError(
                    'id',
                    {msg: Errors.UNKNOWN_VERSION_PROFILE, vars: {profile: id}},
                    ctx.lang
                );
            }

            return profile.list[0];
        },
        async saveVersionProfile({versionProfile, ctx}) {
            const existingVersionProfile = await versionProfileRepo.getVersionProfiles({
                params: {filters: {id: versionProfile.id}},
                ctx
            });

            const isNewProfile = !existingVersionProfile.list.length;

            const actionToCheck = isNewProfile
                ? AdminPermissionsActions.CREATE_VERSION_PROFILE
                : AdminPermissionsActions.EDIT_VERSION_PROFILE;

            const canSave = await adminPermissionDomain.getAdminPermission({
                action: actionToCheck,
                userId: ctx.userId,
                ctx
            });

            if (!canSave) {
                throw new PermissionError(actionToCheck);
            }

            if (!utils.isIdValid(versionProfile.id)) {
                throw utils.generateExplicitValidationError('id', Errors.INVALID_ID_FORMAT, ctx.lang);
            }

            const defaultParams = {
                _key: '',
                label: null,
                description: null,
                trees: []
            };

            const profileToSave: IVersionProfile = isNewProfile
                ? {...defaultParams, ...versionProfile}
                : {
                      ...defaultParams,
                      ...existingVersionProfile.list[0],
                      ...versionProfile
                  };

            // Check all trees exist
            const existingTrees = await treeRepo.getTrees({ctx});
            const unknownTrees = profileToSave.trees.filter(tree => !existingTrees.list.find(t => t.id === tree));

            if (unknownTrees.length) {
                throw utils.generateExplicitValidationError(
                    'trees',
                    {msg: Errors.UNKNOWN_TREES, vars: {trees: unknownTrees.join(', ')}},
                    ctx.lang
                );
            }

            return isNewProfile
                ? versionProfileRepo.createVersionProfile({profileData: profileToSave, ctx})
                : versionProfileRepo.updateVersionProfile({profileData: profileToSave, ctx});
        },
        async deleteVersionProfile({id, ctx}) {
            const existingVersionProfile = await versionProfileRepo.getVersionProfiles({
                params: {filters: {id}},
                ctx
            });

            if (!existingVersionProfile.list.length) {
                throw utils.generateExplicitValidationError(
                    'id',
                    {msg: Errors.UNKNOWN_VERSION_PROFILE, vars: {profile: id}},
                    ctx.lang
                );
            }

            const actionToCheck = AdminPermissionsActions.DELETE_VERSION_PROFILE;
            const canDelete = await adminPermissionDomain.getAdminPermission({
                action: actionToCheck,
                userId: ctx.userId,
                ctx
            });

            if (!canDelete) {
                throw new PermissionError(actionToCheck);
            }

            // Remove profile from attributes using it
            const attributesUsingProfile = await this.getAttributesUsingProfile({id, ctx});
            if (attributesUsingProfile.length) {
                await Promise.all(
                    attributesUsingProfile.map(attribute => {
                        return attributeRepo.updateAttribute({
                            attrData: {
                                ...attribute,
                                multiple_values: attribute.multiple_values,
                                versions_conf: {
                                    ...attribute.versions_conf,
                                    profile: null
                                }
                            },
                            ctx
                        });
                    })
                );
            }

            return versionProfileRepo.deleteVersionProfile({id, ctx});
        },
        async getAttributesUsingProfile({id, ctx}) {
            return versionProfileRepo.getAttributesUsingProfile({id, ctx});
        }
    };
}
