import React from 'react';
import {Breadcrumb, type BreadcrumbSectionProps} from 'semantic-ui-react';
import {type RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {type ITreeLinkElement} from '../../../_types/records';
import PathPart from './PathPart';

export interface ITreeBreadcrumbMenuItem {
    text: string;
    icon: string;
    action: (r: RecordIdentity_whoAmI) => void;
    displayFilter?: (r: RecordIdentity_whoAmI) => boolean;
}

interface ITreeNodeBreadcrumbProps {
    element: ITreeLinkElement;
    actions?: ITreeBreadcrumbMenuItem[];
}

function TreeNodeBreadcrumb({element, actions}: ITreeNodeBreadcrumbProps): JSX.Element {
    const breadcrumbSections: BreadcrumbSectionProps[] = [];
    const altPaths: RecordIdentity_whoAmI[][] = [];

    if (element.ancestors?.length) {
        const defaultPath = element.ancestors.slice(0, -1);

        for (const el of defaultPath) {
            breadcrumbSections.push({
                key: el.record?.whoAmI?.id,
                content: <PathPart record={el.record?.whoAmI} actions={actions} />,
                link: false,
                active: false,
            });
        }
    }

    const elementRecord = element.record;
    if (!!elementRecord && elementRecord.whoAmI) {
        breadcrumbSections.push({
            key: elementRecord.whoAmI.id,
            content: <PathPart record={elementRecord.whoAmI} actions={actions} altPaths={altPaths} />,
            link: false,
            active: true,
        });
    }

    return <Breadcrumb sections={breadcrumbSections} icon="right angle" />;
}

export default TreeNodeBreadcrumb;
