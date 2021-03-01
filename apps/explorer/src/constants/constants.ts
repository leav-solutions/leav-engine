// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, IView, OrderSearch, ViewType} from '../_types/types';

export const selectionColumn = 'selection-column';
export const infosCol = 'infos';

export const defaultNotificationsTime = 5000;

export const panelSize = '20rem';

export const defaultSort = {
    field: 'id',
    order: OrderSearch.asc
};

export const initialColumnsLimit = 5;

export const viewSettingsField = 'fields';

export const attributeExtendedKey = 'extended';

export const defaultView: IView = {
    id: 'default-view',
    label: 'view.default',
    type: ViewType.list,
    shared: false,
    sort: defaultSort
};

export const formatNotUsingCondition = [AttributeFormat.boolean];
