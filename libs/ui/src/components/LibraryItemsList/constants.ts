// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IView} from '_ui/types/views';
import {AttributeFormat, ViewSizes, ViewTypes} from '_ui/_gqlTypes';

export const INFOS_COLUMN_WIDTH = '350px';
export const selectionColumn = 'selection-column';
export const infosCol = 'infos';
export const initialColumnsLimit = 5;
export const viewSettingsField = 'fields';
export const attributeExtendedKey = 'extended';

export const defaultView: IView = {
    id: 'default-view',
    label: {fr: 'Vue par défaut', en: 'Default view'},
    owner: true,
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    shared: false,
    filters: []
};

export const formatNotUsingCondition = [AttributeFormat.boolean];

export const defaultLinkAttributeFilterFormat = AttributeFormat.text;

export const getSelectedViewKey = (libraryId: string) => `selected_view_${libraryId}`;
