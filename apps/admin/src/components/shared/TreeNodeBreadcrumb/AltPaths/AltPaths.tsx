import {type Dispatch, type SetStateAction} from 'react';
import {Modal, Breadcrumb, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {type RecordIdentity_whoAmI} from '../../../../_gqlTypes/RecordIdentity';
import RecordCard from '../../RecordCard';

const PathPartWrapper = styled.div`
    position: relative;
    padding-right: 30px;
    height: 30px;
`;

function AltPaths({
    altPaths = [],
    onClose,
}: {
    altPaths: RecordIdentity_whoAmI[][];
    onClose: Dispatch<SetStateAction<boolean>>;
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
                                            active: false,
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
