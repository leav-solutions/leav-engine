import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
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
     */
    attributePath: string;
    ctx: IQueryInfos;
}) => Promise<IAttribute>;

export interface IGetAttributeByPathDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree': ITreeDomain;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
}: IGetAttributeByPathDeps): GetAttributeByPath {
    // Fetch the library's attributes and resolve the given segment, or throw if it doesn't exist.
    const _resolveSegment = async (
        libraryId: string,
        segment: string,
        fullAttributePath: string,
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
        fullAttributePath: string,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const linkedLibraryId = attribute.linked_library;
        if (!linkedLibraryId) {
            throw new LeavError(
                ErrorTypes.VALIDATION_ERROR,
                `Attribute path "${fullAttributePath}" is invalid: "${attribute.id}" has no linked library`,
            );
        }

        return _validateNestedAttribute(remainingSegments, fullAttributePath, linkedLibraryId, ctx);
    };

    // Follow a TREE attribute: the target library is dynamic (a node can link records from several
    // libraries, and the path carries no library id — same semantics as getRecordFieldValue). The
    // remaining path is valid as soon as it resolves in at least one of the tree's libraries.
    const _traverseTree = async (
        attribute: IAttribute,
        remainingSegments: string[],
        fullAttributePath: string,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const treeProps = await treeDomain.getTreeProperties(attribute.linked_tree, ctx);
        const treeLibraryIds = Object.keys(treeProps?.libraries ?? {});

        for (const treeLibraryId of treeLibraryIds) {
            try {
                return await _validateNestedAttribute(remainingSegments, fullAttributePath, treeLibraryId, ctx);
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
            `Attribute path "${fullAttributePath}" is invalid: "${remainingSegments[0]}" not found in any library linked to tree "${attribute.linked_tree}"`,
        );
    };

    /**
     * Recursively resolve a nested attribute path (e.g., "link_attr.nested_link.final_attr").
     * Follows link attributes to their linked libraries and validates each segment
     */
    const _validateNestedAttribute = async (
        attributeSegments: string[],
        fullAttributePath: string,
        libraryId: string,
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const [currentSegment, ...remainingSegments] = attributeSegments;
        const attribute = await _resolveSegment(libraryId, currentSegment, fullAttributePath, ctx);

        if (remainingSegments.length === 0) {
            return attribute;
        }

        // There are more segments: keep traversing according to the attribute type.
        if ([AttributeTypes.SIMPLE_LINK, AttributeTypes.ADVANCED_LINK].includes(attribute.type)) {
            return _traverseLink(attribute, remainingSegments, fullAttributePath, ctx);
        }

        if (attribute.type === AttributeTypes.TREE) {
            return _traverseTree(attribute, remainingSegments, fullAttributePath, ctx);
        }

        // TODO: extended/date_range sub-paths (e.g. "extended_attr.subfield") are resolvable by
        // getRecordFieldValue but intentionally not accepted here yet - left for a follow-up.
        throw new ValidationError(
            {
                [currentSegment]: {
                    msg: Errors.INVALID_NESTED_ATTRIBUTE_PATH,
                    vars: {attribute: currentSegment},
                },
            },
            `Attribute path "${fullAttributePath}" is invalid: "${currentSegment}" is not a link or tree attribute`,
        );
    };

    return async ({libraryId, attributePath, ctx}) =>
        _validateNestedAttribute(attributePath.split('.'), attributePath, libraryId, ctx);
}
