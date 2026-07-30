import {AttributeFormats, AttributeTypes, type IAttribute, type IEmbeddedAttribute} from '../../../_types/attribute';
import {ErrorTypes, Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import LeavError from '../../../errors/LeavError';
import ValidationError from '../../../errors/ValidationError';
import {type IAttributeDomain} from '../attributeDomain';
import {type ITreeDomain} from '../../tree/treeDomain';

export type GetAttributeByPath = (params: {
    libraryId: string;
    /**
     * Dotted path to traverse links and trees, e.g. `"category"`, `"category.color"`, `"group_tree.uuid"`.
     * With `allowSubFields`, it can also end inside an `extended`/`date_range` payload,
     * e.g. `"campaign_dates.from"`, `"address.city.zipcode"`.
     */
    attributePath: string;
    /**
     * Accept paths going inside the payload of an `extended`/`date_range` attribute (as
     * `getRecordFieldValue` does). The **carrier** attribute is then returned, since a sub-field is
     * not an attribute of its own. Off by default: consumers resolving the last segment as an
     * attribute id (the Excel export builds its column labels that way) would break on such paths.
     */
    allowSubFields?: boolean;
    ctx: IQueryInfos;
}) => Promise<IAttribute>;

export interface IGetAttributeByPathDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree': ITreeDomain;
}

const DATE_RANGE_SUB_FIELDS = ['from', 'to'];

/** Invariants of a whole resolution, threaded unchanged through the recursion. */
interface IResolutionOptions {
    /** The path as originally requested, for error messages mentioning it while resolving a sub-path. */
    fullAttributePath: string;
    allowSubFields: boolean;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
}: IGetAttributeByPathDeps): GetAttributeByPath {
    // Fetch the library's attributes and resolve the given segment, or throw if it doesn't exist.
    const _resolveSegment = async (
        libraryId: string,
        segment: string,
        {fullAttributePath}: IResolutionOptions,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const libraryAttributes = await attributeDomain.getLibraryAttributes(libraryId, ctx);
        const attribute = libraryAttributes.find(attr => attr.id === segment);

        if (!attribute) {
            throw new ValidationError(
                {
                    [segment]: {
                        msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY,
                        vars: {attribute: segment, library: libraryId},
                    },
                },
                `Attribute path "${fullAttributePath}" does not exist in the library "${libraryId}" (attribute "${segment}" not found)`,
            );
        }

        return attribute;
    };

    // Follow a SIMPLE_LINK/ADVANCED_LINK attribute into its linked library and keep traversing.
    const _traverseLink = (
        attribute: IAttribute,
        remainingSegments: string[],
        options: IResolutionOptions,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const linkedLibraryId = attribute.linked_library;
        if (!linkedLibraryId) {
            throw new LeavError(
                ErrorTypes.VALIDATION_ERROR,
                `Attribute path "${options.fullAttributePath}" is invalid: "${attribute.id}" has no linked library`,
            );
        }

        return _validateNestedAttribute(remainingSegments, linkedLibraryId, options, ctx);
    };

    // Follow a TREE attribute: the target library is dynamic (a node can link records from several
    // libraries, and the path carries no library id — same semantics as getRecordFieldValue). The
    // remaining path is valid as soon as it resolves in at least one of the tree's libraries.
    const _traverseTree = async (
        attribute: IAttribute,
        remainingSegments: string[],
        options: IResolutionOptions,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const treeProps = await treeDomain.getTreeProperties(attribute.linked_tree, ctx);
        const treeLibraryIds = Object.keys(treeProps?.libraries ?? {});

        for (const treeLibraryId of treeLibraryIds) {
            try {
                return await _validateNestedAttribute(remainingSegments, treeLibraryId, options, ctx);
            } catch (e) {
                if (!(e instanceof LeavError) || e.type !== ErrorTypes.VALIDATION_ERROR) {
                    throw e;
                }
                // Not valid in this library, try the next one linked to the tree.
            }
        }

        throw new ValidationError(
            {
                [remainingSegments[0]]: {
                    msg: Errors.INVALID_NESTED_ATTRIBUTE_PATH,
                    vars: {attribute: remainingSegments[0]},
                },
            },
            `Attribute path "${options.fullAttributePath}" is invalid: "${remainingSegments[0]}" not found in any library linked to tree "${attribute.linked_tree}"`,
        );
    };

    const _invalidSubFieldError = (segment: string, message: string): ValidationError<unknown> =>
        new ValidationError(
            {[segment]: {msg: Errors.INVALID_NESTED_ATTRIBUTE_PATH, vars: {attribute: segment}}},
            message,
        );

    /**
     * Validate a path going inside the payload of an `extended`/`date_range` attribute and return the
     * **carrier** attribute: a sub-field is not an attribute, so there is nothing more specific to
     * return. Mirrors what `getRecordFieldValue` navigates at value level.
     */
    const _resolveSubFields = (
        attribute: IAttribute,
        subFieldSegments: string[],
        {fullAttributePath}: IResolutionOptions,
    ): IAttribute => {
        if (attribute.format === AttributeFormats.DATE_RANGE) {
            const [subField, ...deeperSegments] = subFieldSegments;

            if (deeperSegments.length > 0 || !DATE_RANGE_SUB_FIELDS.includes(subField)) {
                throw _invalidSubFieldError(
                    subField,
                    `Attribute path "${fullAttributePath}" is invalid: "${subFieldSegments.join('.')}" is not a sub-field of date range attribute "${attribute.id}" (expected ${DATE_RANGE_SUB_FIELDS.map(f => `"${f}"`).join(' or ')})`,
                );
            }

            return attribute;
        }

        // Extended attributes describe their payload through `embedded_fields`, but declaring them is
        // optional: an undeclared level means we know nothing about the payload's shape, so accept the
        // rest of the path rather than rejecting a legitimate sub-field.
        let embeddedFields: IEmbeddedAttribute[] = attribute.embedded_fields;

        for (const segment of subFieldSegments) {
            if (!embeddedFields?.length) {
                return attribute;
            }

            const embeddedField = embeddedFields.find(field => field.id === segment);
            if (!embeddedField) {
                throw _invalidSubFieldError(
                    segment,
                    `Attribute path "${fullAttributePath}" is invalid: "${segment}" is not an embedded field of extended attribute "${attribute.id}"`,
                );
            }

            embeddedFields = embeddedField.embedded_fields;
        }

        return attribute;
    };

    /**
     * Recursively resolve a nested attribute path (e.g., "link_attr.nested_link.final_attr").
     * Follows link attributes to their linked libraries and validates each segment
     */
    const _validateNestedAttribute = async (
        attributeSegments: string[],
        libraryId: string,
        options: IResolutionOptions,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const [currentSegment, ...remainingSegments] = attributeSegments;
        const attribute = await _resolveSegment(libraryId, currentSegment, options, ctx);

        if (remainingSegments.length === 0) {
            return attribute;
        }

        // There are more segments: keep traversing according to the attribute type.
        if ([AttributeTypes.SIMPLE_LINK, AttributeTypes.ADVANCED_LINK].includes(attribute.type)) {
            return _traverseLink(attribute, remainingSegments, options, ctx);
        }

        if (attribute.type === AttributeTypes.TREE) {
            return _traverseTree(attribute, remainingSegments, options, ctx);
        }

        const isSubFieldCarrier =
            attribute.format === AttributeFormats.EXTENDED || attribute.format === AttributeFormats.DATE_RANGE;

        if (options.allowSubFields && isSubFieldCarrier) {
            return _resolveSubFields(attribute, remainingSegments, options);
        }

        throw _invalidSubFieldError(
            currentSegment,
            `Attribute path "${options.fullAttributePath}" is invalid: "${currentSegment}" is not a ${
                options.allowSubFields ? 'link, tree, extended or date range' : 'link or tree'
            } attribute`,
        );
    };

    return async ({libraryId, attributePath, allowSubFields = false, ctx}) =>
        _validateNestedAttribute(
            attributePath.split('.'),
            libraryId,
            {fullAttributePath: attributePath, allowSubFields},
            ctx,
        );
}
