import {useEffect} from 'react';
import {Dimmer, Transition} from 'semantic-ui-react';
import Loading from '../shared/Loading';
import FiltersPanel from './FiltersPanel';
import ListPanel from './ListPanel';
import styles from './MainPanel.module.css';
import {ActionTypes, type IReducerAction, type IReducerState} from './NavigatorReducer';
import TopPanel from './TopPanel';
import {type AvailableLanguage, useQueryLibraryConfigQuery} from '../../_gqlTypes';

export interface IListProps {
    state: IReducerState;
    dispatch: (action: IReducerAction) => void;
}

export default function MainPanel({state, dispatch}: IListProps) {
    if (!state.selectedRootAttributes.length) {
        return <GetLibraryInfos state={state} dispatch={dispatch} />;
    }

    return (
        <Dimmer.Dimmable as="div" dimmed={state.showFilters} className="height100">
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

function GetLibraryInfos({state, dispatch}: IListProps) {
    const {loading, error, data} = useQueryLibraryConfigQuery({
        variables: {
            id: state.selectedRoot,
            lang: state.lang as AvailableLanguage[],
        },
    });

    useEffect(() => {
        if (!data) {
            return;
        }

        dispatch({
            type: ActionTypes.SET_ROOT_INFOS,
            data: {
                label: data.libraries.list[0].label[`${state.lang[0]}`],
                attributes: data.libraries.list[0].attributes,
            },
        });
    }, [data?.libraries]);

    if (loading) {
        return <Loading />;
    }
    if (error) {
        return <p data-testid="error">{error.message}</p>;
    }

    return null;
}
