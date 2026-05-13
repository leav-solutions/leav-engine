import {Divider, Skeleton} from 'antd';

interface IEditRecordSkeletonProps {
    rows: number;
}

const EditRecordSkeleton = ({rows}: IEditRecordSkeletonProps): JSX.Element => {
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
};

export default EditRecordSkeleton;
