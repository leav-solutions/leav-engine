// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Divider, Skeleton} from 'antd';
import React from 'react';

interface IEditRecordSkeletonProps {
    rows: number;
}

function EditRecordSkeleton({rows}: IEditRecordSkeletonProps): JSX.Element {
    const rowsArray = Array(rows)
        .fill('')
        .map((_, i) => i);

    return (
        <>
            {rowsArray.map(el => (
                <div key={el} data-testid="edit-record-skeleton">
                    <Skeleton.Input active size="large" style={{width: 100, margin: '0 .5rem'}} />
                    <Skeleton.Input active size="large" style={{width: 450, margin: '0 .5rem'}} />
                    <Divider />
                </div>
            ))}
        </>
    );
}

export default EditRecordSkeleton;
