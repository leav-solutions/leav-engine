// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {IDateRangeValue, isTypeLink, objectToNameValueArray, omit, WithTypename} from '@leav/utils';
import {TFunction} from 'i18next';
import {SyntheticEvent} from 'react';
import {defaultLinkAttributeFilterFormat} from '_ui/components/LibraryItemsList/constants';
import {PreviewSize} from '_ui/constants';
import {IAttribute} from '_ui/types/search';
import {IValueVersion} from '_ui/types/values';
import {IView} from '_ui/types/views';
import {
    AttributeType,
    PermissionsActions,
    RecordFilterInput,
    RecordIdentityFragment,
    useIsAllowedQuery,
    ValueDetailsFragment,
    ValueVersionInput,
    ViewDetailsFragment
} from '_ui/_gqlTypes';
import {getFiltersFromRequest} from './getFiltersFromRequest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const arrayValueVersionToObject = (version: ValueDetailsFragment['version']): IValueVersion =>
    version?.reduce((acc: IValueVersion, value) => {
        acc[value.treeId] = {
            id: value.treeNode.id,
            label: value.treeNode.record.whoAmI.label
        };

        return acc;
    }, {});

export const objectValueVersionToArray = (version: IValueVersion): ValueVersionInput[] =>
    version
        ? objectToNameValueArray(version).map(v => ({
              treeId: v.name,
              treeNodeId: v?.value?.id ?? null
          }))
        : null;

export const extractPermissionFromQuery = (
    queryResult: ReturnType<typeof useIsAllowedQuery>,
    action: PermissionsActions,
    fallbackPermission = false
): boolean =>
    !queryResult.loading && !queryResult.error
        ? (queryResult.data?.isAllowed?.find(permission => permission.name === action)?.allowed ?? fallbackPermission)
        : fallbackPermission;

export const getPreviewSize = (size?: PreviewSize, simplistic = false) => {
    if (simplistic) {
        return '1.2rem';
    }

    switch (size) {
        case PreviewSize.medium:
            return '3.5rem';
        case PreviewSize.big:
            return '6rem';
        case PreviewSize.small:
            return '2.5rem';
        case PreviewSize.tiny:
            return '1.7rem';
        default:
            return '2rem';
    }
};

export const setDateToUTCNoon = (date: dayjs.Dayjs): dayjs.Dayjs =>
    date.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0);

export const getTreeRecordKey = (record: RecordIdentityFragment): string => `${record.whoAmI.library.id}/${record.id}`;

export const getValueVersionLabel = (version: IValueVersion) =>
    Object.values(version ?? {})
        .map(v => v.label)
        .join(' / ');

export const stringifyDateRangeValue = (value: IDateRangeValue, t: TFunction): string =>
    t('record_edition.date_range_value', {
        ...value,
        interpolation: {escapeValue: false}
    });

/**
 * Cloning gql template tag because some apollo tools like query validation and codegen won't be happy if we use
 * interpolation in template strings. With a different tag name, the query won't be parsed by these tools
 * thus they won't complain about it.
 * It works exactly the same at runtime.
 */
export const gqlUnchecked = gql;

export const getPropertyCacheFieldName = (attributeId: string): string => `property({"attribute":"${attributeId}"})`;

/**
 * Prepare view coming from the server to be used in the app
 */
export const prepareView = (
    view: WithTypename<ViewDetailsFragment>,
    attributes: IAttribute[],
    libraryId: string,
    userId: string
): IView => {
    const viewFilters: RecordFilterInput[] = (view?.filters ?? []).map(filter => ({
        ...filter,
        treeId: filter.tree?.id
    }));

    const viewValuesVersions = (view?.valuesVersions ?? []).map(version => ({
        ...version,
        treeNode: {
            ...version.treeNode,
            title: version.treeNode.record.whoAmI.label
        }
    }));

    return {
        ...omit(view, 'created_by', '__typename'),
        owner: view.created_by.id === userId,
        filters: getFiltersFromRequest(viewFilters, libraryId, attributes),
        sort: (view.sort ?? []).map(s => ({
            field: s.field,
            order: s.order
        })),
        display: omit(view.display, '__typename') as ViewDetailsFragment['display'],
        valuesVersions: viewValuesVersions.reduce((versions: IValueVersion, version): IValueVersion => {
            versions[version.treeId] = {
                id: version.treeNode.id,
                label: version.treeNode.record.whoAmI.label
            };

            return versions;
        }, {}),
        attributes: (view.attributes ?? []).map(attr => attr.id)
    };
};
export const getAttributeFromKey = (key: string, library: string, attributes: IAttribute[]): IAttribute | undefined => {
    const splitKey = key.split('.');

    // Get root attribute by first key part
    const rootAttribute = attributes.find(attr => attr.library === library && attr.id === splitKey[0]);

    if (!rootAttribute) {
        return;
    }

    if (rootAttribute.type === AttributeType.simple || rootAttribute.type === AttributeType.advanced) {
        return rootAttribute;
    }

    if (isTypeLink(rootAttribute.type)) {
        if (splitKey[1]) {
            const linkedAttribute = attributes.find(
                attr => attr.library === rootAttribute?.linkedLibrary?.id && attr.id === splitKey[1]
            );

            return {...linkedAttribute, parentAttribute: {...rootAttribute, format: defaultLinkAttributeFilterFormat}};
        }

        return rootAttribute;
    }

    if (rootAttribute.type === AttributeType.tree) {
        const [, libraryId, linkedTreeAttribute] = splitKey;

        if (!libraryId && !linkedTreeAttribute) {
            // Only root attribute => search on tree
            return {...rootAttribute, format: defaultLinkAttributeFilterFormat};
        } else if (libraryId && !linkedTreeAttribute) {
            return rootAttribute;
        }

        const linkedAttribute = attributes.find(attr => attr.library === splitKey[1] && attr.id === splitKey[2]);

        return linkedAttribute;
    }
};

export const stopEvent = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
};

export const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result.filter(element => !!element);
};
