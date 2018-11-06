import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Checkbox, Table} from 'semantic-ui-react';
import {GET_ATTRIBUTES_attributes} from 'src/_gqlTypes/GET_ATTRIBUTES';

interface IAttributesSelectionListProps {
    attributes: GET_ATTRIBUTES_attributes[];
    selection: string[];
    toggleSelection: (attribute: GET_ATTRIBUTES_attributes) => void;
    t: TranslationFunction;
}

class AttributesSelectionList extends React.Component<IAttributesSelectionListProps> {
    constructor(props: IAttributesSelectionListProps) {
        super(props);
    }

    public render() {
        const {attributes, toggleSelection, selection, t} = this.props;

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
                            <Table.Row key={a.id} onClick={onClick} positive={isSelected}>
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
    }
}

export default translate()(AttributesSelectionList);
