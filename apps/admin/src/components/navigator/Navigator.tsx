// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useReducer, useEffect} from 'react';

import useLang from '../../hooks/useLang';
import RootSelector from './RootSelector';
import MainPanel from './MainPanel';
import reducer, {ActionTypes, initialState} from './NavigatorReducer';
import {RecordIdentity_whoAmI} from '../../_gqlTypes/RecordIdentity';

export type SelectionChanged = (arr: RecordIdentity_whoAmI[]) => void;
export type GetSelectionRef = () => RecordIdentity_whoAmI[];
export type EditRecordClick = (record: RecordIdentity_whoAmI) => any;

export interface INavigatorProps {
    restrictToRoots?: string[];
    onSelectionChanged?: SelectionChanged;
    multipleSelection?: boolean;
    selectable?: boolean;
    getSelectionRef?: React.MutableRefObject<GetSelectionRef | null>;
    onEditRecordClick?: EditRecordClick;
}

function Navigator(props: INavigatorProps): JSX.Element {
    const {lang} = useLang();
    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        ...props,
        lang,
        selectedRoot: props.restrictToRoots && props.restrictToRoots.length === 1 ? props.restrictToRoots[0] : null
    });
    useEffect(() => {
        if (props.getSelectionRef) {
            props.getSelectionRef.current = () => {
                return state.selection;
            };
        }
    }, [props.getSelectionRef, state.selection]);
    const rootSelected = (root: string) =>
        dispatch({
            type: ActionTypes.SET_SELECTED_ROOT,
            data: root
        });
    return state.selectedRoot ? (
        <MainPanel state={state} dispatch={dispatch} />
    ) : (
        <RootSelector restrictToRoots={state.restrictToRoots} lang={state.lang} onSelect={rootSelected} />
    );
}
export default Navigator;
