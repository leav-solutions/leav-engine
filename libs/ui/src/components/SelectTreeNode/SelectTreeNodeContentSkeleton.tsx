import {type FunctionComponent} from 'react';
import {KitSkeleton} from 'aristid-ds';
import styled from 'styled-components';

const KitFirstNodeSkeletonInput = styled(KitSkeleton.KitInputSkeleton)`
    width: 300px;
`;

const KitSecondeNodeSkeletonInput = styled(KitSkeleton.KitInputSkeleton)`
    width: 300px;
    margin-top: calc(var(--general-spacing-xs) * 1px);
`;

const KitLeafSkeletonInput = styled(KitSkeleton.KitInputSkeleton)`
    width: 300px;
    margin-top: calc(var(--general-spacing-xs) * 1px);
    margin-left: calc(var(--general-spacing-s) * 1px);
`;

export const SelectTreeNodeContentSkeleton: FunctionComponent = () => (
    <>
        <KitFirstNodeSkeletonInput active />
        <KitLeafSkeletonInput active />
        <KitLeafSkeletonInput active />
        <KitLeafSkeletonInput active />
        <KitSecondeNodeSkeletonInput active />
        <KitLeafSkeletonInput active />
        <KitLeafSkeletonInput active />
        <KitLeafSkeletonInput active />
    </>
);
