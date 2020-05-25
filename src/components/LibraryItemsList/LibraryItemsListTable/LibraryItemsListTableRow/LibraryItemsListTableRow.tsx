import React, {useState} from 'react';
import {Button, Checkbox, Table} from 'semantic-ui-react';
import {getPreviewUrl} from '../../../../utils';
import {IItem} from '../../../../_types/types';
import LibraryItemsModal from './LibraryItemsModal';
import RecordPreview from './RecordPreview';

interface ILibraryItemsListTableRowProps {
    item: IItem;
}
function LibraryItemsListTableRow({item}: ILibraryItemsListTableRowProps): JSX.Element {
    const [isHover, setIsHover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [values, setValues] = useState(item);

    return (
        <>
            <Table.Row key={item.id} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                <Table.Cell>
                    <RecordPreview
                        label={values.label || values.id}
                        image={values.preview?.small ? getPreviewUrl(values.preview.small) : ''}
                    />
                </Table.Cell>
                <Table.Cell>
                    <Checkbox />
                </Table.Cell>

                <Table.Cell>
                    <span>{values.id}</span>
                    <span className="table-items-buttons">
                        {isHover && (
                            <Button.Group size="small">
                                <Button icon="check" />
                                <Button icon="write" onClick={() => setShowModal(true)} />
                                <Button icon="like" />
                                <Button icon="ellipsis horizontal" />
                            </Button.Group>
                        )}
                    </span>
                </Table.Cell>
                <Table.Cell>{values.label}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
                <Table.Cell>{''}</Table.Cell>
            </Table.Row>

            <LibraryItemsModal
                showModal={showModal}
                setShowModal={setShowModal}
                values={values}
                setValues={setValues}
            />
        </>
    );
}

export default LibraryItemsListTableRow;
