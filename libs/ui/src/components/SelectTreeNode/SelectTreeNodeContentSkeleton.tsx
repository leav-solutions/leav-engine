// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
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
