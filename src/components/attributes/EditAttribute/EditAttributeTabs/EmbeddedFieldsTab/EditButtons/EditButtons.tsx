import {TFunction} from 'i18next';
import React from 'react';
import {Button} from 'semantic-ui-react';
import {AttributeFormat} from '../../../../../../_gqlTypes/globalTypes';
import {IFlatItem} from '../EmbeddedFieldsTab';
import ModalCreateEmbeddedField from '../ModalCreateEmbeddedField';
import ModalRemoveEmbeddedField from '../ModalRemoveEmbeddedField';

interface IEditButtonsProps {
    id: string;
    format: string;
    flatItem: IFlatItem | undefined;
    isRoot: boolean;
    expend: () => void;
    add: (newId: string) => Promise<void>;
    remove: () => Promise<void>;
    t: TFunction;
}

function EditButtons({id, format, flatItem, isRoot, expend, add, remove, t}: IEditButtonsProps): JSX.Element {
    return (
        <Button.Group
            style={{
                position: 'relative',
                left: '1rem',
                top: '-1rem'
            }}
        >
            {!isRoot && (
                <Button basic primary onClick={expend} icon={!flatItem?.displayForm ? 'angle down' : 'angle up'} />
            )}
            {format === AttributeFormat.extended && <ModalCreateEmbeddedField attrId={id} add={add} t={t} />}
            {!isRoot && <ModalRemoveEmbeddedField remove={remove} t={t} />}
        </Button.Group>
    );
}

export default EditButtons;
