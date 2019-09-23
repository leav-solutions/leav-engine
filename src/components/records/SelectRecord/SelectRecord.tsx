import {useLazyQuery} from '@apollo/react-hooks';
import React, {useState} from 'react';
import {Form, Input} from 'semantic-ui-react';
import {getRecordDataQuery} from '../../../queries/records/recordDataQuery';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {IGetRecordData} from '../../../_types/records';
import RecordCard from '../../shared/RecordCard';

interface ISelectRecordProps {
    library: GET_LIBRARIES_libraries_list;
    onSelect: (recordIdentity: RecordIdentity_whoAmI) => void;
}

function SelectRecord({library, onSelect}: ISelectRecordProps): JSX.Element {
    const query = getRecordDataQuery(library, []);
    const [recordId, setRecordId] = useState<string>();
    const [recordData, setRecordData] = useState<RecordIdentity_whoAmI>();
    const [fetchRecordData] = useLazyQuery<IGetRecordData>(query, {
        onCompleted: data => {
            if (data && data.record) {
                setRecordData(data.record.list[0].whoAmI);
            }
        },
        onError: err => {
            console.error(err);
        }
    });

    const _handleChange = e => {
        setRecordId(e.target.value);
    };

    const _handleSelect = () => {
        return recordData && onSelect(recordData);
    };

    const _handleSubmit = async e => {
        e.preventDefault();
        e.stopPropagation();

        fetchRecordData({
            variables: {
                id: recordId
            }
        });
    };

    return (
        <Form onSubmit={_handleSubmit}>
            <Input onChange={_handleChange} name="record_id" />
            {recordData && <RecordCard record={recordData} />}
            <Form.Button type="button" onClick={_handleSubmit}>
                Get Data
            </Form.Button>
            {recordData && <Form.Button onClick={_handleSelect}>SELECT RECORD</Form.Button>}
        </Form>
    );
}

export default SelectRecord;
