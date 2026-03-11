// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type IRecordIdentityWhoAmI} from '_ui/types';
import {type GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';
import styled from 'styled-components';
import PropertiesList from '../../PropertiesList';
import {useRecordInformations} from './useRecordInformations';

interface IInformationsProps {
    record: IRecordIdentityWhoAmI;
    recordData: GetRecordColumnsValuesRecord;
}

const InformationsWrapper = styled.div`
    margin-top: calc(var(--general-spacing-s) * 1px);
`;

export const RecordInformations: FunctionComponent<IInformationsProps> = ({record, recordData}) => {
    const recordInformations = useRecordInformations(record, recordData);

    return (
        <InformationsWrapper>
            <PropertiesList items={recordInformations} />
        </InformationsWrapper>
    );
};
