// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {GET_LIBRARIES_libraries_list} from '../../../../../_gqlTypes/GET_LIBRARIES';
import Navigator from '../../../../navigator/Navigator';
import EditRecordModal from '../../../../records/EditRecordModal';

interface IEditableNavigatorProps {
    library: GET_LIBRARIES_libraries_list | null;
}

function NavigatorTab({library}: IEditableNavigatorProps): JSX.Element {
    const [record, setRecord] = useState(null);
    const _closeEditRecord = () => {
        setRecord(null);
    };
    const _onRecordClick = rec => {
        setRecord(rec);
    };
    const renderModal = rec => {
        return <EditRecordModal open onClose={_closeEditRecord} recordId={rec.id} library={rec.library.id} />;
    };
    if (library) {
        return (
            <>
                <Navigator restrictToRoots={[library.id]} onEditRecordClick={_onRecordClick} />
                {record && renderModal(record)}
            </>
        );
    }
    return <></>;
}

export default NavigatorTab;
