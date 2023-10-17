// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {ErrorDisplay, useLang} from '@leav/ui';
import {Input, List, Spin} from 'antd';
import {useEffect, useReducer, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {getAttributesByLibQuery} from '../../graphQL/queries/attributes/getAttributesByLib';
import {localizedTranslation} from '../../utils';
import {GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables} from '../../_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {ISelectedAttribute} from '../../_types/types';
import Attribute from './Attribute';
import attributeSelectionListReducer, {
    AttributesSelectionListActionTypes,
    initialState
} from './reducer/attributesSelectionListReducer';
import {AttributesSelectionListStateContext} from './reducer/attributesSelectionListStateContext';
import SelectedAttributesList from './SelectedAttributesList';
import {CustomForm} from './sharedComponents';

const ListWrapper = styled.div`
    padding: 0.3rem 1rem 0 1rem;
    overflow-y: scroll;
    height: calc(100vh - 15rem);
`;

const Wrapper = styled.div<{$multiple: boolean}>`
    display: Grid;
    grid-template-columns: repeat(${props => (props.$multiple ? 2 : 1)}, 1fr);
    grid-column-gap: 0.3rem;
`;

interface IAttributesSelectionListProps {
    library: string;
    multiple?: boolean;
    selectedAttributes?: ISelectedAttribute[];
    canExpandExtendedAttributes?: boolean;
    onSelectionChange: (selectedAttributes: ISelectedAttribute[]) => void;
}

function AttributesSelectionList({
    library,
    multiple = true,
    selectedAttributes = [],
    canExpandExtendedAttributes = true,
    onSelectionChange
}: IAttributesSelectionListProps): JSX.Element {
    const {t} = useTranslation();
    const searchRef = useRef<any>(null);
    const {lang} = useLang();
    const [searchValue, setSearchValue] = useState<string>('');

    const [state, dispatch] = useReducer(attributeSelectionListReducer, {
        ...initialState,
        library,
        multiple,
        selectedAttributes,
        canExpandExtendedAttributes
    });

    // Retrieve attributes list
    const {loading, error} = useQuery<GET_ATTRIBUTES_BY_LIB, GET_ATTRIBUTES_BY_LIBVariables>(getAttributesByLibQuery, {
        variables: {
            library
        },
        onCompleted: data => {
            dispatch({
                type: AttributesSelectionListActionTypes.SET_ATTRIBUTES,
                attributes: data.attributes?.list || []
            });
        }
    });

    useEffect(() => {
        onSelectionChange(state.selectedAttributes);
    }, [onSelectionChange, state.selectedAttributes]);

    // Display list
    if (loading) {
        return <Spin />;
    }

    const _handleSearchChange = (search: string) => {
        setSearchValue(search);
    };

    const attributesList = state.attributes.filter(attribute => {
        if (!searchValue) {
            return true;
        }

        const attributeLabel = localizedTranslation(attribute.label, lang).toLowerCase();

        return attributeLabel.indexOf(searchValue) !== -1 || attribute.id.indexOf(searchValue) !== -1;
    });

    return (
        <AttributesSelectionListStateContext.Provider value={{state, dispatch}}>
            <Wrapper $multiple={state.multiple}>
                <ListWrapper data-testid="attributes-list">
                    <CustomForm>
                        <Input.Search
                            placeholder={t('attributes-list.search')}
                            aria-label="search"
                            ref={searchRef}
                            onChange={event => _handleSearchChange(event.target.value ?? '')}
                        />
                    </CustomForm>
                    {error ? (
                        <ErrorDisplay message={error.message} />
                    ) : (
                        <List>
                            {attributesList.map(attribute => (
                                <Attribute
                                    key={attribute.id}
                                    attribute={attribute}
                                    depth={0}
                                    library={library}
                                    path=""
                                />
                            ))}
                        </List>
                    )}
                </ListWrapper>
                {multiple && <SelectedAttributesList data-testid="selected-attributes-list" />}
            </Wrapper>
        </AttributesSelectionListStateContext.Provider>
    );
}

export default AttributesSelectionList;
