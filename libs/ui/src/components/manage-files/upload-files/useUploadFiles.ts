import {useState} from 'react';
import {type StepsProps} from 'antd';
import {useUser} from '_ui/hooks';
import {type UploadMutation, useUploadMutation, useUploadUpdateSubscription} from '_ui/_gqlTypes';
import {type IUploadFile, type ReplaceDecisions} from '../_types';

interface IUseUploadFilesParams {
    libraryId: string;
    onCompleted?: (data: UploadMutation['upload']) => void;
}

/** Owns the file queue, the upload mutation and the progress subscription that feeds it. */
export const useUploadFiles = ({libraryId, onCompleted}: IUseUploadFilesParams) => {
    const {userData} = useUser();

    const [files, setFiles] = useState<IUploadFile[]>([]);
    const [status, setStatus] = useState<StepsProps['status']>('process');
    const [errorMsg, setErrorMsg] = useState<string>();

    const [runUpload, {loading}] = useUploadMutation({
        fetchPolicy: 'no-cache',
        onCompleted: data => {
            onCompleted?.(data.upload);
            setStatus('finish');
        },
        onError: err => {
            setStatus('error');
            setErrorMsg(err.message);
        },
    });

    useUploadUpdateSubscription({
        variables: {filters: {userId: userData.userId}},
        onData: subData => {
            const uploadData = subData.data.data.upload;

            // The entries are `File` instances (cf. IUploadFile), so they are updated in place and
            // the re-render is carried by the new array identity, not by new item identities.
            setFiles(prevState =>
                prevState.map(file => {
                    if (file.uid === uploadData.uid) {
                        file.percent = uploadData.progress.percentage;
                        file.status = uploadData.progress.percentage === 100 ? 'done' : 'uploading';
                    }

                    return file;
                }),
            );
        },
    });

    const addFile = (file: IUploadFile) => {
        file.uid = window.crypto.randomUUID();
        setFiles(prevState => prevState.concat([file]));
    };

    const removeFile = (file: IUploadFile) => setFiles(prevState => prevState.filter(f => f.uid !== file.uid));

    const upload = async (nodeId: string, replaceDecisions: ReplaceDecisions) =>
        runUpload({
            variables: {
                library: libraryId,
                nodeId,
                files: files.map(file => ({
                    data: file,
                    uid: file.uid,
                    size: file.size,
                    replace: replaceDecisions[file.uid],
                })),
            },
        });

    const reset = () => {
        setFiles([]);
        setStatus('process');
        setErrorMsg(undefined);
    };

    return {files, status, errorMsg, loading, addFile, removeFile, upload, reset};
};
