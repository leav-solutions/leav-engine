// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {List, Message} from 'semantic-ui-react';
import styled from 'styled-components';
import {activeItemColor} from 'themingVar';
import {localizedLabel} from 'utils';
import {GET_ATTRIBUTES_attributes_list} from '_gqlTypes/GET_ATTRIBUTES';

const AttributeItem = styled(List.Item)`
    &&&& {
        cursor: pointer;
        padding: 0.5rem;
    }
    &:hover {
        background-color: ${activeItemColor};
    }
`;

interface IPermissionsAttributeSelectorListProps {
    attributes: GET_ATTRIBUTES_attributes_list[];
    onSelect: (selectedAttribute: GET_ATTRIBUTES_attributes_list) => void;
}

function PermissionsAttributeSelectorList({attributes, onSelect}: IPermissionsAttributeSelectorListProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();

    const _handleAttributeClick = (attribute: GET_ATTRIBUTES_attributes_list) => () => {
        onSelect(attribute);
    };

    return (
        <List divided aria-label="attribute-selector-list">
            {!attributes.length && (
                <Message info size="tiny">
                    {t('permissions_settings.no_attributes_to_add')}
                </Message>
            )}
            {attributes.map(attribute => (
                <AttributeItem key={attribute.id} onClick={_handleAttributeClick(attribute)}>
                    <List.Header>{localizedLabel(attribute.label, lang)}</List.Header>
                    <List.Description>{attribute.id}</List.Description>
                </AttributeItem>
            ))}
        </List>
    );
}

export default PermissionsAttributeSelectorList;
