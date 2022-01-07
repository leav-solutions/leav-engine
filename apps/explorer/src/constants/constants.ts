// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, SortOrder, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {IView} from '../_types/types';

export const selectionColumn = 'selection-column';
export const infosCol = 'infos';

export const defaultNotificationsTime = 5000;

export const panelSize = '22.5rem';

export const defaultSort = {
    field: 'id',
    order: SortOrder.asc
};

export const initialColumnsLimit = 5;

export const viewSettingsField = 'fields';

export const attributeExtendedKey = 'extended';

export const defaultView: IView = {
    id: 'default-view',
    label: {fr: 'Vue par défaut', en: 'Default view'},
    owner: true,
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    shared: false,
    filters: [],
    sort: defaultSort
};

export const formatNotUsingCondition = [AttributeFormat.boolean];

export const defaultLinkAttributeFilterFormat = AttributeFormat.text;
