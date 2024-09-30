// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValidateHelper} from 'domain/helpers/validate';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IViewRepo} from 'infra/view/_types';
import moment from 'moment';
import {IUtils} from 'utils/utils';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';

export interface IViewDomain {
    saveView(view: IView, ctx: IQueryInfos): Promise<IView>;
    getViews(library: string, ctx: IQueryInfos): Promise<IList<IView>>;
    getViewById(viewId: string, ctx: IQueryInfos): Promise<IView>;
    deleteView(viewId: string, ctx: IQueryInfos): Promise<IView>;
}

export interface IViewDomainDeps {
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.tree': ITreeDomain;
    'core.infra.view': IViewRepo;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.helpers.validate': validationHelper,
    'core.domain.tree': treeDomain,
    'core.infra.view': viewRepo,
    'core.utils': utils
}: IViewDomainDeps): IViewDomain {
    return {
        async saveView(view: IView, ctx: IQueryInfos): Promise<IView> {
            const isExistingView = !!view.id;

            await validationHelper.validateLibrary(view.library, ctx);

            // Check user is owner
            if (isExistingView) {
                const existingView = await viewRepo.getViews(
                    {
                        filters: {id: view.id},
                        strictFilters: true
                    },
                    ctx
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
                        ctx
                    });

                    if (!isNodePresent) {
                        throw utils.generateExplicitValidationError(
                            'version',
                            {
                                msg: Errors.INVALID_VALUES_VERSIONS_SETTINGS_BAD_NODE_ID,
                                vars: {treeId, nodeId: view.valuesVersions[treeId]}
                            },
                            ctx.lang
                        );
                    }
                }
            }

            const now = moment().unix();

            const viewToSave: IView = {
                ...view,
                modified_at: now
            };

            if (isExistingView) {
                return viewRepo.updateView(viewToSave, ctx);
            }

            viewToSave.created_at = now;
            viewToSave.created_by = ctx.userId;

            return viewRepo.createView(viewToSave, ctx);
        },
        async getViews(library: string, ctx: IQueryInfos): Promise<IList<IView>> {
            await validationHelper.validateLibrary(library, ctx);

            const filters: IViewFilterOptions = {
                library,
                created_by: ctx.userId
            };

            const views = await viewRepo.getViews(
                {
                    filters,
                    withCount: true
                },
                ctx
            );

            return views;
        },
        async getViewById(viewId: string, ctx: IQueryInfos): Promise<IView> {
            const filters: IViewFilterOptions = {
                id: viewId
            };

            const views = await viewRepo.getViews(
                {
                    filters,
                    strictFilters: true,
                    withCount: false
                },
                ctx
            );

            if (!views.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            return views.list[0];
        },
        async deleteView(viewId: string, ctx: IQueryInfos): Promise<IView> {
            // Check view exists
            const existingView = await viewRepo.getViews(
                {
                    filters: {id: viewId},
                    strictFilters: true
                },
                ctx
            );

            if (!existingView.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            // Check user is owner
            const existingViewData = existingView.list[0];
            if (existingViewData.created_by !== ctx.userId) {
                throw new ValidationError({id: Errors.USER_IS_NOT_VIEW_OWNER});
            }

            return viewRepo.deleteView(viewId, ctx);
        }
    };
}
