import {SystemTrees} from '../../../_constants/systemTrees';
import {type ILibraryPermissionDomain} from '../../permission/libraryPermissionDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {LibraryPermissionsActions} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {
    AttributeCondition,
    type IRecord,
    type IRecordFilterLight,
    type IRecordFilterOption,
    type IRecordSort,
    Operator,
    TreeCondition,
} from '../../../_types/record';
import PermissionError from '../../../errors/PermissionError';
import {type IFindRecordParams} from '../_types';
import getAttributesFromField from './getAttributesFromField';
import {type IAttributeWithRevLink} from '../../../infra/attributeTypes/attributeTypesRepo';
import {AttributeFormats, type IAttribute} from '../../../_types/attribute';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {type IPermissionRepo} from '../../../infra/permission/permissionRepo';
import getAccessPermissionFilters from './getAccessPermissionFilters';
import {type IListWithCursor} from '../../../_types/list';
import {type IValidateHelper} from '../../helpers/validate';
import {type IUtils} from '../../../utils/utils';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type GetCoreEntityByIdFunc} from '../../helpers/getCoreEntityById';
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {type IDefaultPermissionHelper} from '../../permission/helpers/defaultPermission';

/**
 * Search records
 * Filters to apply on records selection
 * Fields to retrieve on each records
 */
export type FindRecordsHelper = ({
    params,
    ctx,
}: {
    params: IFindRecordParams;
    ctx: IQueryInfos;
}) => Promise<IListWithCursor<IRecord>>;

/**
 * Simple list of filters (fieldName: filterValue) to apply to get records.
 */
const allowedTypeOperator = {
    string: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.BEGIN_WITH,
        AttributeCondition.END_WITH,
        AttributeCondition.CONTAINS,
        AttributeCondition.NOT_CONTAINS,
        AttributeCondition.START_ON,
        AttributeCondition.START_BEFORE,
        AttributeCondition.START_AFTER,
        AttributeCondition.END_ON,
        AttributeCondition.END_BEFORE,
        AttributeCondition.END_AFTER,
        TreeCondition.CLASSIFIED_IN,
        TreeCondition.NOT_CLASSIFIED_IN,
    ],
    number: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.GREATER_THAN,
        AttributeCondition.LESS_THAN,
        AttributeCondition.START_ON,
        AttributeCondition.START_BEFORE,
        AttributeCondition.START_AFTER,
        AttributeCondition.END_ON,
        AttributeCondition.END_BEFORE,
        AttributeCondition.END_AFTER,
        AttributeCondition.VALUES_COUNT_EQUAL,
        AttributeCondition.VALUES_COUNT_GREATER_THAN,
        AttributeCondition.VALUES_COUNT_LOWER_THAN,
    ],
    boolean: [AttributeCondition.EQUAL, AttributeCondition.NOT_EQUAL],
    null: [
        AttributeCondition.EQUAL,
        AttributeCondition.NOT_EQUAL,
        AttributeCondition.IS_EMPTY,
        AttributeCondition.IS_NOT_EMPTY,
        AttributeCondition.TODAY,
        AttributeCondition.YESTERDAY,
        AttributeCondition.TOMORROW,
        AttributeCondition.LAST_MONTH,
        AttributeCondition.NEXT_MONTH,
    ],
    object: [AttributeCondition.BETWEEN],
};

export interface IFindRecordsHelperDeps {
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.infra.record': IRecordRepo;
    'core.infra.library': ILibraryRepo;
    'core.infra.tree': ITreeRepo;
    'core.utils': IUtils;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.infra.permission': IPermissionRepo;
}

export default function ({
    'core.domain.helpers.validate': validateHelper,
    'core.domain.attribute': attributeDomain,
    'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
    'core.infra.library': libraryRepo,
    'core.domain.permission.library': libraryPermissionDomain,
    'core.infra.record': recordRepo,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.infra.tree': treeRepo,
    'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper,
    'core.infra.permission': permissionRepo,
    'core.utils': utils,
}: IFindRecordsHelperDeps): FindRecordsHelper {
    const _isNumericCondition = (condition: AttributeCondition): boolean =>
        condition === AttributeCondition.VALUES_COUNT_EQUAL ||
        condition === AttributeCondition.VALUES_COUNT_GREATER_THAN ||
        condition === AttributeCondition.VALUES_COUNT_LOWER_THAN;

    const _isRelativeDateCondition = (condition: AttributeCondition): boolean =>
        condition === AttributeCondition.TODAY ||
        condition === AttributeCondition.TOMORROW ||
        condition === AttributeCondition.YESTERDAY ||
        condition === AttributeCondition.NEXT_MONTH ||
        condition === AttributeCondition.LAST_MONTH;

    const _isClassifiedFilter = (filter: IRecordFilterLight): boolean =>
        filter.condition in TreeCondition && typeof filter.treeId !== 'undefined';

    const _validationFilter = async (filter: IRecordFilterLight, ctx: IQueryInfos): Promise<void> => {
        if (typeof filter.condition === 'undefined' && typeof filter.operator === 'undefined') {
            throw utils.generateExplicitValidationError('filters', Errors.INVALID_FILTER_FORMAT, ctx.lang);
        }

        if (filter.condition in AttributeCondition && !_isAttributeFilter(filter)) {
            throw utils.generateExplicitValidationError('filters', Errors.INVALID_ATTRIBUTE_FILTER_FORMAT, ctx.lang);
        }

        if (filter.condition in TreeCondition && !_isClassifiedFilter(filter)) {
            throw utils.generateExplicitValidationError('filters', Errors.INVALID_TREE_FILTER_FORMAT, ctx.lang);
        }
    };

    const _isAttributeFilter = (filter: IRecordFilterLight): boolean =>
        filter.condition in AttributeCondition &&
        typeof filter.field !== 'undefined' &&
        (typeof filter.value !== 'undefined' ||
            filter.condition === AttributeCondition.IS_EMPTY ||
            filter.condition === AttributeCondition.IS_NOT_EMPTY ||
            _isRelativeDateCondition(filter.condition as AttributeCondition));

    const _isOperatorFilter = (filter: IRecordFilterLight): boolean => filter.operator in Operator;

    const _checkLogicExpr = async (filters: IRecordFilterLight[], ctx: IQueryInfos) => {
        const stack = [];
        const output = [];

        // convert to Reverse Polish Notation
        for (const f of filters) {
            await _validationFilter(f, ctx);

            if (!_isOperatorFilter(f)) {
                output.push(f);
            } else if (f.operator !== Operator.CLOSE_BRACKET) {
                stack.push(f);
            } else {
                let e: IRecordFilterOption = stack.pop();

                while (e && e.operator !== Operator.OPEN_BRACKET) {
                    output.push(e);
                    e = stack.pop();
                }

                if (!e) {
                    throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
                }
            }
        }

        const rpn = output.concat(stack.reverse());

        // validation filters logical expression (order)
        let stackSize = 0;

        for (const e of rpn) {
            stackSize += !_isOperatorFilter(e) ? 1 : -1;

            if (stackSize <= 0) {
                throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
            }
        }

        if (stackSize !== 1) {
            throw new ValidationError({id: Errors.INVALID_FILTERS_EXPRESSION});
        }
    };

    return async ({params, ctx}) => {
        const {library, sort, pagination, withCount, retrieveInactive = false, ignorePermissions = false} = params;
        const {filters = [] as IRecordFilterLight[], fulltextSearch} = params;
        const fullFilters: IRecordFilterOption[] = [];
        let fullSort: IRecordSort[] = [];

        await validateHelper.validateLibrary(library, ctx);

        const isLibraryAccessible = await libraryPermissionDomain.getLibraryPermission({
            libraryId: params.library,
            action: LibraryPermissionsActions.ACCESS_LIBRARY,
            ctx,
        });

        if (!isLibraryAccessible) {
            throw new PermissionError(LibraryPermissionsActions.ACCESS_LIBRARY);
        }

        if (filters.length) {
            await _checkLogicExpr(filters, ctx);
        }

        // Hydrate filters with attribute properties and cast filters values if needed
        for (const f of filters) {
            let filter: IRecordFilterOption = {};

            if (_isAttributeFilter(f)) {
                const attributes = await getAttributesFromField({
                    field: f.field,
                    condition: f.condition,
                    deps: {
                        'core.domain.attribute': attributeDomain,
                        'core.infra.library': libraryRepo,
                        'core.infra.tree': treeRepo,
                    },
                    ctx,
                });

                // Set reverse links if necessary.
                const attrsRepo = (await Promise.all(
                    attributes.map(async a =>
                        a.reverse_link
                            ? {
                                  ...a,
                                  reverse_link: await attributeDomain.getAttributeProperties({
                                      id: a.reverse_link as string,
                                      ctx,
                                  }),
                              }
                            : a,
                    ),
                )) as IAttributeWithRevLink[];

                let value: any = f.value ?? null;
                const lastAttr: IAttribute = attrsRepo[attrsRepo.length - 1];

                if (value !== null) {
                    if (
                        lastAttr.format === AttributeFormats.NUMERIC ||
                        (lastAttr.format === AttributeFormats.DATE &&
                            f.condition !== AttributeCondition.BETWEEN &&
                            !_isRelativeDateCondition(filter.condition as AttributeCondition)) ||
                        _isNumericCondition(f.condition as AttributeCondition)
                    ) {
                        value = Number(f.value);
                    } else if (lastAttr.format === AttributeFormats.BOOLEAN) {
                        value = f.value === 'true';
                    } else if (
                        lastAttr.format === AttributeFormats.DATE &&
                        f.condition === AttributeCondition.BETWEEN
                    ) {
                        value = JSON.parse(f.value);

                        if (typeof value.from === 'undefined' || typeof value.to === 'undefined') {
                            throw new ValidationError({condition: Errors.INVALID_FILTER_CONDITION_VALUE});
                        }
                    }
                }

                const valueType = value === null ? 'null' : typeof value;
                if (
                    (f.condition && !allowedTypeOperator[valueType].includes(f.condition)) ||
                    (f.condition === AttributeCondition.BETWEEN &&
                        (typeof value.from === 'undefined' || typeof value.to === 'undefined'))
                ) {
                    throw new ValidationError({condition: Errors.INVALID_FILTER_CONDITION_VALUE});
                }

                filter = {attributes: attrsRepo, value, condition: f.condition};
            } else {
                filter = f;
            }

            fullFilters.push(filter);
        }

        // Check sort fields
        if (sort?.length) {
            fullSort = await Promise.all(
                sort.filter(Boolean).map(async s => {
                    const sortAttributes = await getAttributesFromField({
                        field: s.field,
                        condition: null,
                        deps: {
                            'core.domain.attribute': attributeDomain,
                            'core.infra.library': libraryRepo,
                            'core.infra.tree': treeRepo,
                        },
                        ctx,
                    });

                    const sortAttributesRepo = (await Promise.all(
                        sortAttributes.map(async a =>
                            a.reverse_link
                                ? {
                                      ...a,
                                      reverse_link: await attributeDomain.getAttributeProperties({
                                          id: a.reverse_link as string,
                                          ctx,
                                      }),
                                  }
                                : a,
                        ),
                    )) as IAttributeWithRevLink[];

                    return {
                        attributes: sortAttributesRepo,
                        order: s.order,
                    };
                }, []),
            );
        }

        const groupsId = ctx?.groupsId || [];
        let accessPermissionFilters = [];

        if (!ignorePermissions) {
            const groupsWithAncestorsId = [];
            for (const groupId of groupsId) {
                const ancestors = await elementAncestorsHelper.getCachedElementAncestors({
                    treeId: SystemTrees.USERS_GROUPS,
                    nodeId: groupId,
                    ctx,
                });
                const ancestorsId = ancestors.map(a => a.id).reverse(); // reverse to have list from leaf to root
                groupsWithAncestorsId.push(ancestorsId);
            }

            accessPermissionFilters = await getAccessPermissionFilters(
                {
                    groupsIds: groupsWithAncestorsId,
                    library,
                    deps: {
                        'core.domain.helpers.getCoreEntityById': getCoreEntityById,
                        'core.infra.tree': treeRepo,
                        'core.infra.permission': permissionRepo,
                        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
                    },
                },
                ctx,
            );
        }

        return recordRepo.find({
            libraryId: library,
            filters: fullFilters,
            sort: fullSort,
            pagination,
            withCount,
            retrieveInactive,
            fulltextSearch,
            accessPermissionFilters,
            ctx,
        });
    };
}
