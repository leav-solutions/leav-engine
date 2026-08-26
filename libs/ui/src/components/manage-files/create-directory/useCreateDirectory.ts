import {useState} from 'react';
import {type StepsProps} from 'antd';
import {type CreateDirectoryMutation, useCreateDirectoryMutation} from '_ui/_gqlTypes';

interface IUseCreateDirectoryParams {
    libraryId: string;
    onCompleted?: (data: CreateDirectoryMutation['createDirectory']) => void;
}

/** Owns the directory name and the creation mutation. */
export const useCreateDirectory = ({libraryId, onCompleted}: IUseCreateDirectoryParams) => {
    const [directoryName, setDirectoryName] = useState<string>();
    const [status, setStatus] = useState<StepsProps['status']>('wait');

    const [runCreateDirectory, {loading}] = useCreateDirectoryMutation({
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            onCompleted?.(data.createDirectory);
            setStatus('finish');
        },
        onError: () => setStatus('error'),
    });

    const createDirectory = async (nodeId: string) => {
        setStatus('process');

        const {errors} = await runCreateDirectory({
            variables: {library: libraryId, nodeId, name: directoryName},
        });

        return !errors?.length;
    };

    const reset = () => {
        setDirectoryName('');
        setStatus('wait');
    };

    return {directoryName, setDirectoryName, status, loading, createDirectory, reset};
};
