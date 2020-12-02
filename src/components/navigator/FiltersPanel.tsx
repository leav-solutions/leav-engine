// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useEffect, useMemo, useReducer} from 'react';
import {Button, Dropdown, Icon, Input, Label, Segment} from 'semantic-ui-react';
import styles from './FiltersPanel.module.css';
import {IListProps} from './MainPanel';
import {ActionTypes, IFilter} from './NavigatorReducer';

const emptyFilter: IFilter = {
    attribute: '',
    value: '',
    operator: '='
};

enum LocalActionTypes {
    ADD_FILTER = 'ADD_FILTER',
    REMOVE_FILTER = 'REMOVE_FILTER',
    CHANGE_VALUE = 'CHANGE_VALUE',
    CHANGE_ATTRIBUTE = 'CHANGE_ATTRIBUTE',
    RESET = 'RESET'
}

const localReducer = (state, action) => {
    switch (action.type) {
        case LocalActionTypes.ADD_FILTER:
            return [...state, {...emptyFilter}];
        case LocalActionTypes.REMOVE_FILTER:
            const stateCopy = [...state];
            stateCopy.splice(action.data, 1);
            return stateCopy;
        case LocalActionTypes.CHANGE_VALUE:
            state[action.data.index] = {...state[action.data.index], value: action.data.value};
            return [...state];
        case LocalActionTypes.CHANGE_ATTRIBUTE:
            state[action.data.index] = {...state[action.data.index], attribute: action.data.value};
            return [...state];
        case LocalActionTypes.RESET:
            if (action.data.length === 0) {
                return [{...emptyFilter}];
            }
            return action.data;
        default:
            return state;
    }
};

export default function FiltersPanel({state, dispatch}: IListProps) {
    const [localState, localDispatch] = useReducer(localReducer, state.filters);
    const toggleFilters = () => {
        localDispatch({
            type: LocalActionTypes.RESET,
            data: state.filters
        });
        dispatch({
            type: ActionTypes.TOGGLE_FILTERS,
            data: null
        });
    };
    useEffect(() => {
        if (state.showFilters) {
            localDispatch({
                type: LocalActionTypes.RESET,
                data: state.filters
            });
        }
    }, [state.filters, state.showFilters]);

    const attributesDropDownOptions = useMemo(() => {
        return state.selectedRootAttributes.map(attribute => {
            return {
                key: attribute.id,
                text: attribute.label?.fr,
                value: attribute.id
            };
        });
    }, [state.selectedRootAttributes]);

    const applyFilters = () => {
        const goodFilters = localState.filter(f => {
            return f.attribute !== '' && f.operator !== '' && f.value !== '';
        });
        dispatch({
            type: ActionTypes.SET_FILTERS,
            data: goodFilters
        });
    };

    const addFilter = () => {
        localDispatch({
            type: LocalActionTypes.ADD_FILTER,
            data: null
        });
    };
    const memoizedFunctions = useMemo(() => {
        return {
            removeFilter: (i: number) => {
                localDispatch({
                    type: LocalActionTypes.REMOVE_FILTER,
                    data: i
                });
            },
            changeValue: (i: number, value: string) => {
                localDispatch({
                    type: LocalActionTypes.CHANGE_VALUE,
                    data: {
                        index: i,
                        value
                    }
                });
            },
            changeAttribute: (i: number, value: string) => {
                localDispatch({
                    type: LocalActionTypes.CHANGE_ATTRIBUTE,
                    data: {
                        index: i,
                        value
                    }
                });
            }
        };
    }, [localDispatch]);

    const renderFilter = useMemo(() => {
        return (filterData, index) => {
            const onRemove = () => {
                memoizedFunctions.removeFilter(index);
            };
            const onChangeValue = e => {
                memoizedFunctions.changeValue(index, e.target.value);
            };
            const onChangeAttribute = (_, data) => {
                memoizedFunctions.changeAttribute(index, data.value);
            };
            return (
                <Input
                    key={index}
                    fluid
                    labelPosition="left"
                    type="text"
                    placeholder="Value..."
                    className={styles.filter}
                >
                    <Dropdown
                        style={{width: '40%'}}
                        placeholder="Attribute"
                        search
                        selection
                        options={attributesDropDownOptions}
                        className={styles.filterAttribute}
                        onChange={onChangeAttribute}
                        value={filterData.attribute}
                    />
                    <Label className={styles.filterFunction}>=</Label>
                    <input
                        data-id={index}
                        onChange={onChangeValue}
                        value={filterData.value}
                        className={styles.filterValue}
                    />
                    <Button as="a" negative onClick={onRemove} className={styles.filterRemove}>
                        <Icon name="delete" />
                    </Button>
                </Input>
            );
        };
    }, [attributesDropDownOptions, memoizedFunctions]);
    const onSubmit = e => {
        e.preventDefault();
        applyFilters();
    };
    return (
        <Segment
            className="inverted"
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '75%',
                bottom: 0,
                textAlign: 'left',
                boxSizing: 'border-box'
            }}
        >
            <h4 className="ui right floated header">
                <i className="ui window close icon" onClick={toggleFilters} />
            </h4>
            <form onSubmit={onSubmit}>
                <h4 className="ui left floated header">
                    <Button type="button" onClick={addFilter}>
                        <Icon name="add" /> Add filter
                    </Button>
                    <Button type="submit" primary>
                        <Icon name="filter" /> Apply filters
                    </Button>
                </h4>
                <div className="ui divider clearing" />

                {localState.map(renderFilter)}
            </form>
        </Segment>
    );
}
