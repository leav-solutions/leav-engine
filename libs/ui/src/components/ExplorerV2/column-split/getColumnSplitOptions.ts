import {AttributeType} from '_ui/_gqlTypes';
import {type AttributeProperties} from '../_types';
import {type IColumnSplitOption} from './_types';

const _isLinkAttribute = (type: AttributeType): boolean =>
    type === AttributeType.simple_link || type === AttributeType.advanced_link;

/**
 * The possible values of a splittable attribute, one per sub-column, derived from the metadata already
 * loaded by `useExplorerLibraryMetadata` (`valuesList` on the `ExplorerV2AttributeProperties` fragment).
 *
 * A PURE function, deliberately not a hook: the options are part of the library metadata loaded once
 * upfront, so there is nothing left to fetch when a column is split. Tree attributes are the exception —
 * their options are the linked tree's root nodes, which the metadata query does not carry — so they are
 * resolved by a query in `useColumnSplitSources`, the single entry point routing between both sources.
 */
export const getColumnSplitOptions = (attribute: AttributeProperties): IColumnSplitOption[] => {
    const valuesList = 'valuesList' in attribute ? attribute.valuesList : undefined;

    if (!valuesList) {
        return [];
    }

    if (_isLinkAttribute(attribute.type) && 'linkedValues' in valuesList) {
        return valuesList.linkedValues.map(record => ({
            key: record.whoAmI.id,
            label: record.whoAmI.label ?? record.whoAmI.id,
            color: record.whoAmI.color,
            rawValue: record.whoAmI.id,
        }));
    }

    if ('values' in valuesList && valuesList.values) {
        return valuesList.values.map(value => ({key: value, label: value, rawValue: value}));
    }

    return [];
};
