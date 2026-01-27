import {type IEmbeddedField} from '_ui/components/RecordHistory/_queries/recordHistoryQuery';
import {localizedTranslation} from '@leav/utils';

// This function compares two extended attribute values and returns the differences
export const getExtendedAttributeDiffs = (
    extendedValueBefore: unknown | undefined,
    extendedValueAfter: unknown | undefined,
    path: string[] = [],
    diffs: Array<{path: string; before: string | null; after: string | null}> = [],
): Array<{path: string; before: string | null; after: string | null}> => {
    if (
        (typeof extendedValueBefore !== 'object' || extendedValueBefore === null) &&
        (typeof extendedValueAfter !== 'object' || extendedValueAfter === null)
    ) {
        if (extendedValueBefore !== extendedValueAfter) {
            diffs.push({
                path: path.join('.'),
                before:
                    extendedValueBefore === null || extendedValueBefore === undefined
                        ? null
                        : String(extendedValueBefore),
                after:
                    extendedValueAfter === null || extendedValueAfter === undefined ? null : String(extendedValueAfter),
            });
        }

        return diffs;
    }

    const keys = new Set([...Object.keys(extendedValueBefore || {}), ...Object.keys(extendedValueAfter || {})]);
    for (const key of keys) {
        getExtendedAttributeDiffs(extendedValueBefore?.[key], extendedValueAfter?.[key], [...path, key], diffs);
    }

    return diffs;
};

// This function retrieves the labels for each part of the dot-separated path
export const getExtendedAttributeLabels = (
    path: string, // dot separated path
    embeddedFields: IEmbeddedField[], // root embedded fields
    lang: string[],
    unknownAttributeLabel: string,
): string[] => {
    let nestedEmbeddedFields = [...embeddedFields];
    let current: IEmbeddedField = null;
    const labels: string[] = [];

    for (const id of path.split('.')) {
        current = nestedEmbeddedFields.find(attr => attr.id === id);
        if (!current) {
            break;
        }
        labels.push(localizedTranslation(current?.label, lang) || current?.id || unknownAttributeLabel);
        nestedEmbeddedFields = current.embedded_fields ?? [];
    }

    return labels;
};
