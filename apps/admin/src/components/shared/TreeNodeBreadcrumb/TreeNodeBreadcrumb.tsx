// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Breadcrumb, BreadcrumbSectionProps} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../_gqlTypes/RecordIdentity';
import {ITreeLinkElement} from '../../../_types/records';
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
                active: false
            });
        }
    }

    const elementRecord = element.record;
    if (!!elementRecord && elementRecord.whoAmI) {
        breadcrumbSections.push({
            key: elementRecord.whoAmI.id,
            content: <PathPart record={elementRecord.whoAmI} actions={actions} altPaths={altPaths} />,
            link: false,
            active: true
        });
    }

    return <Breadcrumb sections={breadcrumbSections} icon="right angle" />;
}

export default TreeNodeBreadcrumb;
