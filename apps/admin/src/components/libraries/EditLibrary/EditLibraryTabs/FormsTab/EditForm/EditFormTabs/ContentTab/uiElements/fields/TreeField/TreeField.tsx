import RecordCardSkeleton from '../../../../../../../../../../shared/RecordCardSkeleton';
import {Breadcrumb, type BreadcrumbSectionProps, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {type ICommonFieldsSettings, type IFormElementProps} from '../../../_types';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../../../utils';

const CenteredBreadcrumb = styled(Breadcrumb)`
    && {
        display: flex;
        align-items: center;
    }
`;

function TreeField({settings}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {lang: availableLangs} = useLang();

    const label = localizedLabel(settings.label, availableLangs);

    const nodes = [];
    const sectionsNumber = 3;

    const breadcrumbSection: BreadcrumbSectionProps[] = [...Array(sectionsNumber)].map((s, i) => ({
        key: i,
        content: <RecordCardSkeleton />,
        link: false,
        active: false,
    }));

    return (
        <Table celled striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>{label}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell width="4">
                        <CenteredBreadcrumb icon="right angle" sections={breadcrumbSection} />
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    );
}

export default TreeField;
