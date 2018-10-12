import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Table} from 'semantic-ui-react';
import {GET_ATTRIBUTES_attributes} from '../../_gqlTypes/GET_ATTRIBUTES';

interface IAttributesListProps {
    attributes: GET_ATTRIBUTES_attributes[] | null;
    t: TranslationFunction;
    onRowClick: (attribute: GET_ATTRIBUTES_attributes) => void;
}

function AttributesList({attributes, t, onRowClick}: IAttributesListProps): JSX.Element {
    return attributes !== null ? (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{t('attributes.label')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('attributes.ID')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('attributes.type')}</Table.HeaderCell>
                    <Table.HeaderCell>{t('attributes.format')}</Table.HeaderCell>
                    <Table.HeaderCell />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {attributes.map(a => {
                    const attrLabel = a.label !== null ? a.label.fr || a.label.en || a.id : a.id;
                    const onClick = () => onRowClick(a);
                    return (
                        <Table.Row key={a.id} onClick={onClick}>
                            <Table.Cell>{attrLabel}</Table.Cell>
                            <Table.Cell>{a.id}</Table.Cell>
                            <Table.Cell>{t('attributes.types.' + a.type)}</Table.Cell>
                            <Table.Cell>{a.format ? t('attributes.formats.' + a.format) : ''}</Table.Cell>
                            <Table.Cell />
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    ) : (
        <p>No attributes</p>
    );
}

export default translate()(AttributesList);
