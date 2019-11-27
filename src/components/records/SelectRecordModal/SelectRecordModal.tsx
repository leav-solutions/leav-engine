import {useQuery} from '@apollo/react-hooks';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Modal} from 'semantic-ui-react';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '../../../_gqlTypes/GET_LIBRARIES';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import Loading from '../../shared/Loading';
import SelectRecord from '../SelectRecord';

interface IEditRecordFormSelectRecordProps {
    open: boolean;
    library: string;
    onSelect: (record: RecordIdentity_whoAmI) => void;
    onClose: () => void;
}

// TODO: refactor this when navigtor is available
/* tslint:disable-next-line:variable-name */
const EditRecordFormSelectRecord = ({
    library,
    open,
    onClose,
    onSelect
}: IEditRecordFormSelectRecordProps): JSX.Element => {
    const {t} = useTranslation();
    // TODO: handle error
    const {data, loading, error} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {id: library}
    });

    let modalContent;

    if (loading) {
        modalContent = <Loading withDimmer />;
    } else if (error) {
        modalContent = <p>ERROR {error}</p>;
    } else if (!data || !data.libraries || !data.libraries.list) {
        modalContent = <p>Unknown library</p>;
    } else {
        const lib = data.libraries.list[0];
        modalContent = <SelectRecord library={lib} onSelect={onSelect} />;
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>{t('records.select_record')}</Modal.Header>
            <Modal.Content>{modalContent}</Modal.Content>
            <Modal.Actions>
                <Button data-test-id="select-record-modal-close-btn" onClick={onClose} />
            </Modal.Actions>
        </Modal>
    );
};

export default EditRecordFormSelectRecord;
