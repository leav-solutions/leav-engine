import {type FunctionComponent} from 'react';
import {KitInput} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IDirectoryNameStepProps {
    value?: string;
    onChange: (name: string) => void;
}

export const DirectoryNameStep: FunctionComponent<IDirectoryNameStepProps> = ({value, onChange}) => {
    const {t} = useSharedTranslation();

    return (
        <KitInput
            data-testid="directory-name-input"
            label={t('create_directory.directory_name')}
            placeholder={t('create_directory.directory_name')}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    );
};
