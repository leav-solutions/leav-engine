// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import attributesReducer from './attributes';
import displayReducer from './display';
import fieldsReducer from './fields';
import filtersReducer from './filters';
import itemsReducer from './items';
import selectionReducer from './selection';
import viewReducer from './view';

const store = configureStore({
    reducer: {
        items: itemsReducer,
        view: viewReducer,
        display: displayReducer,
        attributes: attributesReducer,
        fields: fieldsReducer,
        filters: filtersReducer,
        selection: selectionReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<RootDispatch>();

export default store;
