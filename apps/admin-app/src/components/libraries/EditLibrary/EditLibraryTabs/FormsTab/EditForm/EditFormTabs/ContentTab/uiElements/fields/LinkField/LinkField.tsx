// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

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
    return (
        <>
            <Table celled striped>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell colSpan="3">{settings.label}</Table.HeaderCell>
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
        </>
    );
}

export default LinkField;
