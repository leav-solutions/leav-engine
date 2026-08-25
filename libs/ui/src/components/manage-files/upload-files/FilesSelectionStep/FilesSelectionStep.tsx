import {type FunctionComponent} from 'react';
import {KitAlert, KitDivider, KitUpload} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IUploadFile} from '../../_types';

const UNLIMITED_FILES = 99999;

interface IFilesSelectionStepProps {
    files: IUploadFile[];
    multiple: boolean;
    disabled: boolean;
    errorMsg?: string;
    onAdd: (file: IUploadFile) => void;
    onRemove: (file: IUploadFile) => void;
}

/**
 * Drop zone and queue of files to upload. The list itself, its progress bars and its remove buttons
 * come from `KitUpload`'s own item renderer.
 */
export const FilesSelectionStep: FunctionComponent<IFilesSelectionStepProps> = ({
    files,
    multiple,
    disabled,
    errorMsg,
    onAdd,
    onRemove,
}) => {
    const {t} = useSharedTranslation();

    return (
        <>
            <KitUpload.Dragger
                data-testid="dragger"
                name="files"
                description={t('upload.dragger_content')}
                multiple={multiple}
                maxCount={multiple ? UNLIMITED_FILES : 1}
                fileList={files}
                disabled={disabled}
                beforeUpload={async file => {
                    onAdd(file);

                    // Uploading is triggered by the wizard, not by the drop itself
                    return false;
                }}
                onRemove={onRemove}
            />
            {!!errorMsg && (
                <>
                    <KitDivider />
                    <KitAlert type="error" message={errorMsg} />
                </>
            )}
        </>
    );
};
