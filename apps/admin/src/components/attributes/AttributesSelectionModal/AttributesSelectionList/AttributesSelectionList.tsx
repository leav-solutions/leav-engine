// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Checkbox, Table} from 'semantic-ui-react';
import {GET_ATTRIBUTES_attributes_list} from '../../../../_gqlTypes/GET_ATTRIBUTES';

interface IAttributesSelectionListProps {
    attributes: GET_ATTRIBUTES_attributes_list[];
    selection: string[];
    toggleSelection: (attribute: GET_ATTRIBUTES_attributes_list) => void;
}

const AttributesSelectionList = (props: IAttributesSelectionListProps): JSX.Element => {
    const {t} = useTranslation();
    const {attributes, toggleSelection, selection} = props;

    return (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>{t('attributes.label')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('attributes.ID')}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {attributes.map(a => {
                    const attrLabel = a.label !== null ? a.label.fr || a.label.en || a.id : a.id;
                    const onClick = () => toggleSelection(a);
                    const isSelected = selection.indexOf(a.id) !== -1;
                    return (
                        <Table.Row key={a.id} onClick={onClick} active={isSelected}>
                            <Table.Cell>
                                <Checkbox readOnly checked={isSelected} />
                            </Table.Cell>
                            <Table.Cell>{attrLabel}</Table.Cell>
                            <Table.Cell>{a.id}</Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
};

export default AttributesSelectionList;
