// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Modal, Breadcrumb, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import RecordCard from '../../RecordCard';
import * as Crypto from 'crypto';

const PathPartWrapper = styled.div`
    position: relative;
    padding-right: 30px;
    height: 30px;
`;

function AltPaths({
    altPaths = [],
    onClose
}: {
    altPaths: RecordIdentity_whoAmI[][];
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
    return (
        <Modal size="fullscreen" open onClose={() => onClose(false)}>
            <Modal.Content>
                <Table>
                    <Table.Body>
                        {altPaths.map(p => (
                            <Table.Row key={p.map(e => e.id).join('')}>
                                <Table.Cell collapsing>
                                    <Breadcrumb
                                        sections={p.map(r => ({
                                            key: r.id,
                                            content: (
                                                <PathPartWrapper data-test-id="path_part_wrapper">
                                                    <RecordCard record={r} />
                                                </PathPartWrapper>
                                            ),
                                            link: false,
                                            active: false
                                        }))}
                                        icon="right angle"
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Modal.Content>
        </Modal>
    );
}

export default AltPaths;
