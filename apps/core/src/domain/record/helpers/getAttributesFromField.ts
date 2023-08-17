// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../../_types/attribute';
import {Errors} from '../../../_types/errors';
import {AttributeCondition} from '../../../_types/record';
import {IRecordFilterLight} from '../recordDomain';

interface IDeps {
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.tree'?: ITreeRepo;
}

export interface IGetAttributesFromFieldsHelper {
    getAttributesFromField: (field: string, ctx: IQueryInfos) => Promise<IAttribute[]>;
}

/**
 * Return attributes to use in search from field sent by client.
 * This field is a string made of different parts, concatenate with a dot.
 * Example: created_by.login => will return the attribute created_by and login
 *
 * @param field
 * @param ctx
 */
const getAttributesFromField = async (params: {
    field: string;
    condition: IRecordFilterLight['condition'];
    visitedLibraries?: string[];
    deps: IDeps;
    ctx: IQueryInfos;
}): Promise<IAttribute[]> => {
    const {field, condition, visitedLibraries = [], deps, ctx} = params;
    const {
        'core.domain.attribute': attributeDomain = null,
        'core.infra.library': libraryRepo = null,
        'core.infra.tree': treeRepo = null
    } = deps;

    const _getLabelOrIdAttribute = async (library: string): Promise<string> => {
        if (visitedLibraries.includes(library)) {
            return 'id';
        }

        visitedLibraries.push(library);

        const linkedLibraryProps = await libraryRepo.getLibraries({
            params: {filters: {id: library}},
            ctx
        });

        return linkedLibraryProps.list.length && linkedLibraryProps.list[0].recordIdentityConf?.label
            ? linkedLibraryProps.list[0].recordIdentityConf?.label
            : 'id'; // label is not configured, search on ID
    };

    const fields = field.split('.');

    if (!fields.length) {
        return [];
    }

    // Get type and format for first field => this is the "main" attribute we're filtering from
    const mainAttribute = await attributeDomain.getAttributeProperties({id: fields[0], ctx});
    let attributes: IAttribute[] = [mainAttribute];
    switch (mainAttribute.type) {
        case AttributeTypes.SIMPLE:
        case AttributeTypes.ADVANCED:
            if (mainAttribute.format === AttributeFormats.EXTENDED) {
                // filter string is: <tree attribute>.<sub field>.<sub field>.<...>
                const [, ...extendedFields] = fields;

                for (const extendedField of extendedFields) {
                    attributes.push({
                        id: extendedField,
                        type: AttributeTypes.SIMPLE,
                        format: AttributeFormats.EXTENDED
                    });
                }
            }
            break;
        case AttributeTypes.SIMPLE_LINK:
        case AttributeTypes.ADVANCED_LINK: {
            // filter string is: <link attribute>.<child attribute>
            let [, childAttribute] = fields;

            // If we have not selected a sub-attribute on a link attribute, force search on label
            if (!childAttribute) {
                childAttribute = await _getLabelOrIdAttribute(mainAttribute.linked_library);
            }

            // Check if child attribute is really linked to library
            const attrLinkedLibraryAttributes = await attributeDomain.getLibraryAttributes(
                mainAttribute.linked_library,
                ctx
            );

            if (!attrLinkedLibraryAttributes.find(a => a.id === childAttribute)) {
                throw new ValidationError({id: Errors.INVALID_FILTER_FIELDS});
            }

            // Calling this function recursively will handle the case where child attribute is a link
            // For example, if we filter on "category.created_by", we'll actually search on category.created_by.label
            const subChildAttributes =
                condition !== AttributeCondition.IS_EMPTY && condition !== AttributeCondition.IS_NOT_EMPTY
                    ? await getAttributesFromField({
                          field: childAttribute,
                          visitedLibraries,
                          condition,
                          deps,
                          ctx
                      })
                    : [];
            attributes = [...attributes, ...subChildAttributes];

            break;
        }
        case AttributeTypes.TREE: {
            // filter string is: <tree attribute>.<tree library>.<child attribute>
            const [, treeLibrary, childAttribute] = fields;
            if (!treeLibrary && !childAttribute) {
                // Get libraries linked to tree
                const linkedTree = await treeRepo.getTrees({
                    params: {filters: {id: mainAttribute.linked_tree}},
                    ctx
                });

                if (!linkedTree.list.length) {
                    throw new ValidationError({
                        id: {msg: Errors.UNKNOWN_TREES, vars: {trees: [mainAttribute.linked_tree]}}
                    });
                }

                // Get label attribute for each library
                const treeLibraries = Object.keys(linkedTree.list[0].libraries ?? {});
                for (const treeLinkedLibrary of treeLibraries) {
                    const libProps = (
                        await libraryRepo.getLibraries({
                            params: {filters: {id: treeLinkedLibrary}},
                            ctx
                        })
                    )?.list?.[0];

                    if (!libProps) {
                        // This means tree configuration is invalid, ignore this lib
                        continue;
                    }

                    try {
                        const libLabelAttributeProps = await attributeDomain.getAttributeProperties({
                            id: await _getLabelOrIdAttribute(libProps.id),
                            ctx
                        });
                        attributes.push(libLabelAttributeProps);
                    } catch (err) {
                        // Ignore error, we just won't use this attribute for search
                    }
                }
            } else if (treeLibrary && !childAttribute) {
                const libProps = (
                    await libraryRepo.getLibraries({
                        params: {filters: {id: treeLibrary}},
                        ctx
                    })
                )?.list?.[0];

                if (!libProps) {
                    // This means tree configuration is invalid, ignore this lib
                    break;
                }

                try {
                    const libLabelAttributeProps = await attributeDomain.getAttributeProperties({
                        id: libProps.recordIdentityConf.label,
                        ctx
                    });
                    attributes.push(libLabelAttributeProps);
                } catch (err) {
                    // Ignore error, we just won't use this attribute for search
                }
            } else {
                // Check if child attribute really exists
                const treeLibraryAttributes = await attributeDomain.getLibraryAttributes(treeLibrary, ctx);

                if (!treeLibraryAttributes.find(a => a.id === childAttribute)) {
                    throw new ValidationError({id: Errors.INVALID_FILTER_FIELDS});
                }

                // Calling this function recursively will handle the case where child attribute is a link
                // For example, if we filter on "category.created_by", we'll actually search on category.created_by.label
                const subChildAttributes = await getAttributesFromField({field: childAttribute, condition, deps, ctx});
                attributes = [...attributes, ...subChildAttributes];
            }

            break;
        }
    }

    return attributes;
};

export default getAttributesFromField;
