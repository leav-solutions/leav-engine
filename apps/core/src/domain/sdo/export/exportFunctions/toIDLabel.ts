import {logger} from '@leav/logger';
import pMap from 'p-map';
import {AttributeTypes, type IAttribute} from '../../../../_types/attribute';
import {ErrorTypes} from '../../../../_types/errors';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {type IRecord} from '../../../../_types/record';
import {
    type ISDOExportMappingFunction,
    type ISDOIdLabel,
    type SDOMappingAttributeFormat,
    NATIVE_SDO_EXPORT_FUNCTIONS,
} from '../../../../_types/sdo';
import {type ILinkValue, type ITreeValue, type IValue} from '../../../../_types/value';
import LeavError from '../../../../errors/LeavError';
import {type IRecordDomain} from '../../../record/recordDomain';

interface IDeps {
    'core.domain.record': IRecordDomain;
}

const fnName = NATIVE_SDO_EXPORT_FUNCTIONS.TO_ID_LABEL;

/**
 * A link can hold a lot of entities (a PAC with hundreds, even thousands of campaigns), and each pair
 * costs a uuid lookup plus a record identity resolution. Resolving them all at once would fire that
 * many concurrent db reads; bound the fan-out instead.
 */
const RESOLUTION_CONCURRENCY = 20;

const LINKED_ATTRIBUTE_TYPES = [AttributeTypes.SIMPLE_LINK, AttributeTypes.ADVANCED_LINK, AttributeTypes.TREE];

/**
 * A SIMPLE_LINK holds exactly one record whatever `multiple_values` says, so it is always single —
 * same reading as `_mapRecordAttributeValue`.
 */
const _isMultiple = (attributeProps: IAttribute): boolean =>
    attributeProps.type !== AttributeTypes.SIMPLE_LINK && Boolean(attributeProps.multiple_values);

/**
 * The entity a value points at. A tree value points at a NODE: what we want is the record the node
 * carries, not the node itself.
 */
const _getLinkedRecord = (value: IValue, attributeProps: IAttribute): IRecord | null =>
    attributeProps.type === AttributeTypes.TREE
        ? ((value as ITreeValue).payload?.record ?? null)
        : ((value as ILinkValue).payload ?? null);

const _assertUsableConfig = (attributeProps: IAttribute | undefined, format: SDOMappingAttributeFormat): IAttribute => {
    // Unlike a computed block, this function transforms the values of ONE attribute: without a carrier
    // attribute there is nothing for it to read.
    if (!attributeProps) {
        throw new LeavError(
            ErrorTypes.INTERNAL_ERROR,
            `${fnName}(): the mapping entry must declare a leavAttributeId pointing at a link or tree attribute`,
        );
    }

    if (!LINKED_ATTRIBUTE_TYPES.includes(attributeProps.type)) {
        throw new LeavError(
            ErrorTypes.INTERNAL_ERROR,
            `${fnName}(): attribute ${attributeProps.id} is of type ${attributeProps.type}, expected one of ${LINKED_ATTRIBUTE_TYPES.join(', ')}`,
        );
    }

    // `_cleanValue` would otherwise coerce a mismatch instead of reporting it: `array` declared on a
    // single-valued attribute exports `[]`, and `object` declared on a multivalued one exports the raw
    // array against the announced shape. Both hide the misconfiguration this function exists to fix.
    const expectedFormat: SDOMappingAttributeFormat = _isMultiple(attributeProps) ? 'array' : 'object';
    if (format !== expectedFormat) {
        throw new LeavError(
            ErrorTypes.INTERNAL_ERROR,
            `${fnName}(): format "${format}" declared on the ${
                expectedFormat === 'array' ? 'multivalued' : 'single-valued'
            } attribute ${attributeProps.id}, expected "${expectedFormat}"`,
        );
    }

    return attributeProps;
};

/**
 * Native export function turning a link or tree attribute into `{id, label}` pairs — one per linked
 * entity, id and label staying paired, which two twinned mapping entries could never guarantee.
 *
 * Multivalued attribute (`format: "array"`) → an array in the order leav returns the values;
 * single-valued (`format: "object"`) → one object, or `null` when the attribute holds no value.
 */
export default function ({'core.domain.record': recordDomain}: IDeps): ISDOExportMappingFunction {
    const _toIdLabel = async (linkedRecord: IRecord, ctx: IQueryInfos): Promise<ISDOIdLabel> => {
        // Always the record's OWN library, never the attribute's `linked_library`: a tree holds records
        // of several libraries, and the link repos derive the payload's library from the value edge, so
        // it is the authoritative one in every case.
        const {id, library} = linkedRecord;

        const [uuid, recordIdentity] = await Promise.all([
            recordDomain.getRecordUUID(library, id, ctx),
            recordDomain.getRecordIdentity({id, library}, ctx),
        ]);

        if (uuid === null) {
            // Degrade rather than throw: throwing here would nack the message and drop the WHOLE export
            // over one unreferenceable entity.
            logger.warn(`[SDO] ${fnName}: no uuid found for ${library}/${id}, exporting id: null`);
        }

        return {
            id: uuid,
            // `getLabel` is null when the target library configures no label, and resolves to null when
            // it configures one the record has no value for. Both fall back to the leav id, as
            // exportDomain and indexationManagerDomain already do.
            label: (await recordIdentity.getLabel?.()) || id,
        };
    };

    return async ({values, attributeProps, format, ctx}) => {
        const linkedAttribute = _assertUsableConfig(attributeProps, format);

        const linkedRecords = (values ?? [])
            .map(value => _getLinkedRecord(value, linkedAttribute))
            .filter((linkedRecord): linkedRecord is IRecord => linkedRecord !== null);

        // pMap preserves input order, so the pairs stay in the order leav returns the values.
        const pairs = await pMap(linkedRecords, record => _toIdLabel(record, ctx), {
            concurrency: RESOLUTION_CONCURRENCY,
        });

        return _isMultiple(linkedAttribute) ? pairs : (pairs[0] ?? null);
    };
}
