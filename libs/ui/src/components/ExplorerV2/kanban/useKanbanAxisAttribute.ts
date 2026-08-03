import {useKanbanAxisAttributeQuery} from '_ui/_gqlTypes';

interface IUseKanbanAxisAttributeResult {
    isAxisLoading: boolean;
    /** Tree backing the axis attribute (columns = its root nodes); null for a non-tree attribute. */
    linkedTreeId: string | null;
    /** Multivalued axis: drag & drop is disabled (phase 1 is mono-valued, like the mass edition). */
    isAxisMultiple: boolean;
}

/**
 * Loads the axis attribute metadata upfront, independently from the records: the board structure
 * (columns) must render even when no record is loaded, so the linked tree id cannot be read off the
 * records' attributesProperties (derived from the first loaded record).
 */
export const useKanbanAxisAttribute = (attributeId: string | undefined): IUseKanbanAxisAttributeResult => {
    const {data, loading} = useKanbanAxisAttributeQuery({
        skip: !attributeId,
        variables: {attributeId: attributeId ?? ''},
    });

    const attribute = data?.attributes?.list[0];

    return {
        isAxisLoading: loading,
        linkedTreeId: attribute && 'linked_tree' in attribute ? (attribute.linked_tree?.id ?? null) : null,
        isAxisMultiple: attribute?.multiple_values ?? false,
    };
};
