// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {attributesInitialState} from 'redux/attributes';
import {displayInitialState} from 'redux/display';
import {fieldsInitialState} from 'redux/fields';
import {filtersInitialState} from 'redux/filters';
import {itemsInitialState} from 'redux/items';
import {navigationInitialState} from 'redux/navigation';
import {selectionInitialState} from 'redux/selection';
import {viewInitialState} from 'redux/view';

export const mockInitialState = {
    attributes: attributesInitialState,
    display: displayInitialState,
    fields: fieldsInitialState,
    filters: filtersInitialState,
    items: itemsInitialState,
    view: viewInitialState,
    selection: selectionInitialState,
    navigation: navigationInitialState
};
