import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {ILibrary, LibraryBehavior} from '../../../_types/library';
import {IQueryInfos} from '../../../_types/queryInfos';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';

export type IfJoinRecordValueCallback<R> = (joinLibId: string, joinAttributeProps: IAttribute) => Promise<R>;
export type IfJoinRecordValue = <R = unknown>(
    attributeProps: IAttribute,
    callback: IfJoinRecordValueCallback<R>,
    ctx: IQueryInfos
) => Promise<R>;

interface IDeps {
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.domain.attribute': IAttributeDomain;
}

export default function ({
    'core.domain.helpers.getCoreEntityById': getCoreEntityById,
    'core.domain.attribute': attributeDomain
}: IDeps): IfJoinRecordValue {

    return async <R>(
        attributeProps: IAttribute,
        callback: IfJoinRecordValueCallback<R>,
        ctx: IQueryInfos
    ): Promise<R> => {
        if (attributeProps.linked_library) {
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
                    // And may be handle joinAttributeProps.type === AttributeTypes.ADVANCED_LINK without multiple_values
                ) {
                    return callback(joinLibId, joinAttributeProps);
                }
            }
        }
    };
}