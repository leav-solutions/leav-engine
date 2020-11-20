import {useQuery} from '@apollo/client';
import {Spin} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useBaseNotification} from '../../hooks/BaseNotificationHook';
import {getTreeListQuery} from '../../queries/trees/getTreeListQuery';
import {ITree, NotificationType} from '../../_types/types';
import TreeItem from '../TreeItem';

const ContainerTreeList = styled.div`
    display: grid;
    grid-gap: 16px;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    margin: 1rem;
    width: 100vw;
`;

function TreeList(): JSX.Element {
    const {t} = useTranslation();
    const [treeList, setTreeList] = useState<ITree[]>([]);
    const [, setBaseNotification] = useBaseNotification();

    const {data, loading, error} = useQuery(getTreeListQuery);

    useEffect(() => {
        setBaseNotification({content: t('notification.base-message'), type: NotificationType.basic});
    }, [setBaseNotification, t]);

    useEffect(() => {
        if (!loading && data) {
            setTreeList(data?.trees?.list);
        }
    }, [loading, data]);

    if (loading) {
        return <Spin />;
    }

    if (error) {
        return <span>error</span>;
    }

    return (
        <ContainerTreeList>
            {treeList.map(tree => (
                <div key={tree.id}>
                    <TreeItem tree={tree} />
                </div>
            ))}
        </ContainerTreeList>
    );
}

export default TreeList;
