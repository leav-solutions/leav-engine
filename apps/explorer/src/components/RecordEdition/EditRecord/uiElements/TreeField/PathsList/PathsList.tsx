// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Breadcrumb, List} from 'antd';
import RecordCard from 'components/shared/RecordCard';
import {IRecordCardProps} from 'components/shared/RecordCard/RecordCard';
import {TreePath} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import styled from 'styled-components';
import {PreviewSize} from '_types/types';

interface IPathsListProps {
    paths: TreePath[];
    recordCardSettings?: Partial<IRecordCardProps>;
}

const BreadcrumbRoot = styled(Breadcrumb)`
    display: flex;
    align-items: center;
`;

const BreadcrumbItem = styled(Breadcrumb.Item)`
    display: flex;
    align-items: center;

    padding: 0.5em 0;
`;

function PathsList({paths, recordCardSettings}: IPathsListProps): JSX.Element {
    const renderItem = (path: TreePath) => {
        const parents = path.slice(0, -1);
        const element = path.slice(-1)[0];

        return (
            <BreadcrumbRoot separator="">
                {parents.map(ancestor => {
                    return (
                        <BreadcrumbItem key={ancestor.record.id}>
                            <RecordCard
                                record={ancestor.record.whoAmI}
                                size={PreviewSize.small}
                                {...recordCardSettings}
                            />
                            <Breadcrumb.Separator>{'>'}</Breadcrumb.Separator>
                        </BreadcrumbItem>
                    );
                })}
                <BreadcrumbItem key={element.record.id}>
                    <RecordCard record={element.record.whoAmI} size={PreviewSize.small} {...recordCardSettings} />
                </BreadcrumbItem>
            </BreadcrumbRoot>
        );
    };

    return <List dataSource={paths} renderItem={renderItem} bordered={false} />;
}

export default PathsList;
