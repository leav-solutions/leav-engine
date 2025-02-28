// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Table} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';
import styled from 'styled-components';
import useLang from 'hooks/useLang';
import {localizedLabel} from 'utils';

const PreviewSkeleton = styled.div`
    border-radius: 50%;
    background: #ddd;
    margin-right: 1em;
    height: 2em;
    width: 2em;
    flex-grow: 0;
`;

const TextSkeleton = styled.div`
    background: #ddd;
    height: 1.5em;
    flex-grow: 1;
`;

const CellWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

function LinkField({settings}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {label: settingsLabel} = settings;
    const {lang: availableLangs} = useLang();

    const label = localizedLabel(settingsLabel, availableLangs);

    return (
        <Table celled striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell colSpan="3">{label}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell width="4">
                        <CellWrapper>
                            <PreviewSkeleton />
                            <TextSkeleton />
                        </CellWrapper>
                    </Table.Cell>
                    <Table.Cell width="6">
                        <TextSkeleton />
                    </Table.Cell>
                    <Table.Cell width="6">
                        <TextSkeleton />
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    );
}

export default LinkField;
