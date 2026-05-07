// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IValidateHelper} from '../helpers/validate';
import {type ITreeDomain} from '../tree/treeDomain';
import {type IViewV2Repo} from '../../infra/viewV2/_types';
import dayjs from 'dayjs';
import {type IUtils} from '../../utils/utils';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {type IViewV2, type IViewV2FilterOptions} from '../../_types/viewsV2';

export interface IViewV2Domain {
    saveViewV2(view: IViewV2, ctx: IQueryInfos): Promise<IViewV2>;
    getViewsV2(library: string, ctx: IQueryInfos): Promise<IList<IViewV2>>;
    getViewV2ById(viewId: string, ctx: IQueryInfos): Promise<IViewV2>;
    deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2>;
}

export interface IViewV2DomainDeps {
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.tree': ITreeDomain;
    'core.infra.viewV2': IViewV2Repo;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.helpers.validate': validationHelper,
    'core.domain.tree': treeDomain,
    'core.infra.viewV2': viewV2Repo,
    'core.utils': utils,
}: IViewV2DomainDeps): IViewV2Domain {
    return {
        async saveViewV2(view: IViewV2, ctx: IQueryInfos): Promise<IViewV2> {
            const isExistingView = !!view.id;

            await validationHelper.validateLibrary(view.library, ctx);

            // Check user is owner
            if (isExistingView) {
                const existingView = await viewV2Repo.getViewsV2(
                    {
                        filters: {id: view.id},
                        strictFilters: true,
                    },
                    ctx,
                );

                if (!existingView.list.length) {
                    throw new ValidationError({id: Errors.UNKNOWN_VIEW});
                }

                const existingViewData = existingView.list[0];

                if (existingViewData.created_by !== ctx.userId) {
                    throw new ValidationError({id: Errors.USER_IS_NOT_VIEW_OWNER});
                }
            }

            // Validate values versions settings
            if (view.valuesVersions) {
                // Check version settings are valid: treeId is part of the profile and tree node exist
                for (const treeId of Object.keys(view.valuesVersions)) {
                    await validationHelper.validateTree(treeId, true, ctx);

                    const isNodePresent = await treeDomain.isNodePresent({
                        treeId,
                        nodeId: view.valuesVersions[treeId],
                        ctx,
                    });

                    if (!isNodePresent) {
                        throw utils.generateExplicitValidationError(
                            'version',
                            {
                                msg: Errors.INVALID_VALUES_VERSIONS_SETTINGS_BAD_NODE_ID,
                                vars: {treeId, nodeId: view.valuesVersions[treeId]},
                            },
                            ctx.lang,
                        );
                    }
                }
            }

            const now = dayjs().unix();

            const viewToSave: IViewV2 = {
                ...view,
                modified_at: now,
            };

            if (isExistingView) {
                return viewV2Repo.updateViewV2(viewToSave, ctx);
            }

            viewToSave.created_at = now;
            viewToSave.created_by = ctx.userId;

            return viewV2Repo.createViewV2(viewToSave, ctx);
        },
        async getViewsV2(library: string, ctx: IQueryInfos): Promise<IList<IViewV2>> {
            await validationHelper.validateLibrary(library, ctx);

            const filters: IViewV2FilterOptions = {
                library,
                created_by: ctx.userId,
            };

            const views = await viewV2Repo.getViewsV2(
                {
                    filters,
                    withCount: true,
                },
                ctx,
            );

            return views;
        },
        async getViewV2ById(viewId: string, ctx: IQueryInfos): Promise<IViewV2> {
            const filters: IViewV2FilterOptions = {
                id: viewId,
            };

            const views = await viewV2Repo.getViewsV2(
                {
                    filters,
                    strictFilters: true,
                    withCount: false,
                },
                ctx,
            );

            if (!views.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            return views.list[0];
        },
        async deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2> {
            // Check view exists
            const existingView = await viewV2Repo.getViewsV2(
                {
                    filters: {id: viewId},
                    strictFilters: true,
                },
                ctx,
            );

            if (!existingView.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            // Check user is owner
            const existingViewData = existingView.list[0];
            if (existingViewData.created_by !== ctx.userId) {
                throw new ValidationError({id: Errors.USER_IS_NOT_VIEW_OWNER});
            }

            return viewV2Repo.deleteViewV2(viewId, ctx);
        },
    };
}
