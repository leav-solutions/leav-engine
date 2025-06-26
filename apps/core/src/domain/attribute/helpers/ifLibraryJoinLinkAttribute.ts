// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {IQueryInfos} from '../../../_types/queryInfos';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';

export type IfLibraryJoinLinkAttributeCallback<R> = (joinLibId: string, joinAttributeProps: IAttribute) => Promise<R>;
export type IfLibraryJoinLinkAttribute = <R = unknown>(
    attributeProps: IAttribute,
    callback: IfLibraryJoinLinkAttributeCallback<R>,
    ctx: IQueryInfos
) => Promise<R | void>;

export interface IIfLibraryJoinLinkDeps {
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.attribute': IAttributeDomain;
}

export default function ({
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.attribute': attributeDomain
}: IIfLibraryJoinLinkDeps): IfLibraryJoinLinkAttribute {
    return async <R>(
        attributeProps: IAttribute,
        callback: IfLibraryJoinLinkAttributeCallback<R>,
        ctx: IQueryInfos
    ): Promise<R | void> => {
        if (
            [AttributeTypes.ADVANCED_LINK, AttributeTypes.SIMPLE_LINK, AttributeTypes.TREE].includes(
                attributeProps.type
            ) &&
            attributeProps.linked_library
        ) {
            const joinLibId = attributeProps.linked_library; // e.g. structure_item
            const joinLibProps = await getCoreEntityById<ILibrary>('library', joinLibId, ctx);

            if (joinLibProps.behavior === LibraryBehavior.JOIN && joinLibProps.mandatoryAttribute) {
                const joinAttributeProps = await attributeDomain.getAttributeProperties({
                    id: joinLibProps.mandatoryAttribute, // e.g. structure_item_thematic
                    ctx
                });
                if (
                    joinAttributeProps.type === AttributeTypes.SIMPLE_LINK ||
                    (joinAttributeProps.type === AttributeTypes.TREE && joinAttributeProps.multiple_values === false)
                    // And maybe handle joinAttributeProps.type === AttributeTypes.ADVANCED_LINK without multiple_values
                ) {
                    return callback(joinLibId, joinAttributeProps);
                }
            }
        }
    };
}
