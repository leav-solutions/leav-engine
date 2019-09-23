import React from 'react';
import {Breadcrumb, BreadcrumbSectionProps, Table} from 'semantic-ui-react';
import {ITreeLinkValue} from '../../../../../../../_types/records';
import PathPart from './PathPart';

interface IEditRecordFormLinksTreeElementProps {
    value: ITreeLinkValue;
    readOnly?: boolean;
    onDeleteLink: (value: ITreeLinkValue) => void;
}

function EditRecordFormLinksTreeElement({
    value,
    readOnly,
    onDeleteLink
}: IEditRecordFormLinksTreeElementProps): JSX.Element {
    const breadcrumbSections: BreadcrumbSectionProps[] = [];

    const _handleDeleteLink = () => onDeleteLink(value);

    if (value.value) {
        if (!!value.value.ancestors) {
            const recordPath = value.value.ancestors.slice(0, -1);
            for (const parent of recordPath) {
                if (!parent.record || !parent.record.whoAmI) {
                    continue;
                }

                breadcrumbSections.push({
                    key: parent.record.whoAmI.id,
                    content: <PathPart record={parent.record.whoAmI} />,
                    link: false,
                    active: false
                });
            }
        }

        const recordValue = value.value.record;
        if (!!recordValue && recordValue.whoAmI) {
            breadcrumbSections.push({
                key: recordValue.whoAmI.id,
                content: <PathPart record={recordValue.whoAmI} deletable={!readOnly} onDelete={_handleDeleteLink} />,
                link: false,
                active: true
            });
        }
    }

    return (
        <>
            {value.value && (
                <Table.Row>
                    <Table.Cell>
                        <Breadcrumb sections={breadcrumbSections} icon="right angle" />
                    </Table.Cell>
                </Table.Row>
            )}
        </>
    );
}

export default EditRecordFormLinksTreeElement;
