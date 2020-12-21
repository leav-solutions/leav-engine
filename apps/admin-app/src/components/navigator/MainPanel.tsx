// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React from 'react';
import {Dimmer, Transition} from 'semantic-ui-react';
import Loading from '../shared/Loading';
import FiltersPanel from './FiltersPanel';
import ListPanel from './ListPanel';
import styles from './MainPanel.module.css';
import {ActionTypes, IReducerAction, IReducerState} from './NavigatorReducer';
import TopPanel from './TopPanel';

export interface IListProps {
    state: IReducerState;
    dispatch: (action: IReducerAction) => void;
}

export default function MainPanel({state, dispatch}: IListProps) {
    if (!state.selectedRootQuery || !state.selectedRootAttributes) {
        return <GetLibraryInfos state={state} dispatch={dispatch} />;
    }
    return (
        <Dimmer.Dimmable as={'div'} dimmed={state.showFilters} className="height100">
            <div className={`${styles.TopPanelContainer} ${state.showFilters ? styles.blurred : ''}`}>
                <TopPanel state={state} dispatch={dispatch} />
            </div>
            <div className={`ui segment ${styles.ListPanelContainer} ${state.showFilters ? styles.blurred : ''}`}>
                <ListPanel state={state} dispatch={dispatch} />
            </div>
            <Transition visible={state.showFilters} animation="fade left" duration={350}>
                <Dimmer.Inner
                    active={state.showFilters}
                    className="height100"
                    style={{backgroundColor: 'rgba(0,0,0,0.6)'}}
                >
                    <FiltersPanel state={state} dispatch={dispatch} />
                </Dimmer.Inner>
            </Transition>
        </Dimmer.Dimmable>
    );
}

export const QUERY_LIBRARY_CONFIG = gql`
    query QUERY_LIBRARY_CONFIG($id: ID, $lang: [AvailableLanguage!]) {
        libraries(filters: {id: $id}) {
            list {
                id
                label(lang: $lang)
                gqlNames {
                    query
                    filter
                }
                attributes {
                    id
                    type
                    format
                    label(lang: $lang)
                }
            }
        }
    }
`;

function GetLibraryInfos({state, dispatch}: IListProps) {
    const {loading, error, data} = useQuery(QUERY_LIBRARY_CONFIG, {
        variables: {
            id: state.selectedRoot,
            lang: state.lang
        }
    });
    if (loading) {
        return <Loading />;
    }
    if (error) {
        return <p data-testid="error">{error.message}</p>;
    }
    dispatch({
        type: ActionTypes.SET_ROOT_INFOS,
        data: {
            label: data.libraries.list[0].label[`${state.lang[0]}`],
            query: data.libraries.list[0].gqlNames.query,
            filter: data.libraries.list[0].gqlNames.filter,
            attributes: data.libraries.list[0].attributes
        }
    });
    return null;
}
