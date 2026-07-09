import {type IValidateHelper} from '../helpers/validate';
import {type ITreeDomain} from '../tree/treeDomain';
import {type IViewV2Repo} from '../../infra/viewV2/viewV2Repo';
import dayjs from 'dayjs';
import {type z} from 'zod';
import {type IUtils} from '../../utils/utils';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {
    type IViewV2,
    type IViewV2CreateInput,
    type IViewV2FilterOptions,
    type IViewV2UpdateInput,
    type IViewV2ValuesVersion,
    ViewV2Shortcut,
} from '../../_types/viewsV2';
import {viewV2UpdateFieldsSchema, viewV2UserFieldsSchema} from './viewV2ZodSchema';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {type ILibraryPermissionDomain} from '../permission/libraryPermissionDomain';

export interface IViewV2Domain {
    createViewV2(input: IViewV2CreateInput, ctx: IQueryInfos): Promise<IViewV2>;
    updateViewV2(input: IViewV2UpdateInput, ctx: IQueryInfos): Promise<IViewV2>;
    getViewsV2(library: string, origin: string | null, ctx: IQueryInfos): Promise<IList<IViewV2>>;
    getViewV2ById(viewId: string, ctx: IQueryInfos): Promise<IViewV2>;
    deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2>;
}

export interface IViewV2DomainDeps {
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.tree': ITreeDomain;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.infra.viewV2': IViewV2Repo;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.helpers.validate': validationHelper,
    'core.domain.tree': treeDomain,
    'core.domain.permission.library': libraryPermissionDomain,
    'core.infra.viewV2': viewV2Repo,
    'core.utils': utils,
}: IViewV2DomainDeps): IViewV2Domain {
    const _parseInput = <T extends z.ZodTypeAny>(schema: T, input: unknown): void => {
        const result = schema.safeParse(input);
        if (result.success) {
            return;
        }
        const details = result.error.issues.reduce(
            (acc, issue) => {
                const path = issue.path.join('.') || '_root';
                acc[path] = {msg: Errors.INVALID_VIEW_V2_INPUT, vars: {details: issue.message}};
                return acc;
            },
            {} as Record<string, {msg: string; vars: Record<string, unknown>}>,
        );
        throw new ValidationError(details, 'Invalid view v2 input');
    };

    const _canManageView = async (view: IViewV2, ctx: IQueryInfos): Promise<boolean> => {
        if (view.created_by === ctx.userId) {
            return true;
        }
        if (!view.shared) {
            // A private view stays manageable by its owner only, regardless of permission.
            return false;
        }
        return libraryPermissionDomain.getLibraryPermission({
            action: LibraryPermissionsActions.MANAGE_VIEWS,
            libraryId: view.library,
            ctx,
        });
    };

    const _validateValuesVersions = async (valuesVersions: IViewV2ValuesVersion, ctx: IQueryInfos): Promise<void> => {
        for (const treeId of Object.keys(valuesVersions)) {
            await validationHelper.validateTree(treeId, true, ctx);

            const isNodePresent = await treeDomain.isNodePresent({
                treeId,
                nodeId: valuesVersions[treeId],
                ctx,
            });

            if (!isNodePresent) {
                throw utils.generateExplicitValidationError(
                    'version',
                    {
                        msg: Errors.INVALID_VALUES_VERSIONS_SETTINGS_BAD_NODE_ID,
                        vars: {treeId, nodeId: valuesVersions[treeId]},
                    },
                    ctx.lang,
                );
            }
        }
    };

    return {
        async createViewV2(input: IViewV2CreateInput, ctx: IQueryInfos): Promise<IViewV2> {
            _parseInput(viewV2UserFieldsSchema, input);

            await validationHelper.validateLibrary(input.library, ctx);

            if (input.valuesVersions) {
                await _validateValuesVersions(input.valuesVersions, ctx);
            }

            const now = dayjs().unix();

            return viewV2Repo.createViewV2(
                {
                    library: input.library,
                    label: input.label,
                    display: {
                        type: input.display.type,
                        attributes: input.display.attributes ?? [],
                        settings: input.display.settings,
                    },
                    shared: input.shared,
                    filters: input.filters ?? [],
                    sorts: input.sorts ?? [],
                    shortcuts: input.shortcuts ?? [ViewV2Shortcut.DISPLAY],
                    valuesVersions: input.valuesVersions,
                    // No default: undefined for explorer views (stays absent in DB), set only when the
                    // caller creates a view from a custom panel.
                    origin: input.origin,
                    created_by: ctx.userId,
                    created_at: now,
                    modified_at: now,
                },
                ctx,
            );
        },
        async updateViewV2(input: IViewV2UpdateInput, ctx: IQueryInfos): Promise<IViewV2> {
            const {id: _id, ...userFields} = input;
            _parseInput(viewV2UpdateFieldsSchema, userFields);

            if (input.library !== undefined) {
                await validationHelper.validateLibrary(input.library, ctx);
            }

            if (input.valuesVersions) {
                await _validateValuesVersions(input.valuesVersions, ctx);
            }

            const existingView = await viewV2Repo.getViewsOwnedOrSharedV2(
                {filters: {id: input.id}, strictFilters: true},
                ctx,
            );
            if (!existingView.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            if (!(await _canManageView(existingView.list[0], ctx))) {
                throw new ValidationError({id: Errors.USER_IS_NOT_VIEW_OWNER});
            }

            return viewV2Repo.updateViewV2(
                {
                    ...input,
                    modified_at: dayjs().unix(),
                },
                ctx,
            );
        },
        async getViewsV2(library: string, origin: string | null, ctx: IQueryInfos): Promise<IList<IViewV2>> {
            await validationHelper.validateLibrary(library, ctx);

            const filters: IViewV2FilterOptions = {
                library,
                created_by: ctx.userId,
                // Always scope by origin. `null` matches views without an origin field (explorer
                // views, transparent — no backfill); a string matches a given kind (e.g. 'planning').
                origin,
            };

            return viewV2Repo.getViewsOwnedOrSharedV2({filters, withCount: true}, ctx);
        },
        async getViewV2ById(viewId: string, ctx: IQueryInfos): Promise<IViewV2> {
            const views = await viewV2Repo.getViewsOwnedOrSharedV2(
                {filters: {id: viewId, created_by: ctx.userId}, strictFilters: true, withCount: false},
                ctx,
            );

            if (!views.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            return views.list[0];
        },
        async deleteViewV2(viewId: string, ctx: IQueryInfos): Promise<IViewV2> {
            const existingView = await viewV2Repo.getViewsOwnedOrSharedV2(
                {filters: {id: viewId}, strictFilters: true},
                ctx,
            );

            if (!existingView.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_VIEW});
            }

            if (!(await _canManageView(existingView.list[0], ctx))) {
                throw new ValidationError({id: Errors.USER_IS_NOT_VIEW_OWNER});
            }

            return viewV2Repo.deleteViewV2(viewId, ctx);
        },
    };
}
