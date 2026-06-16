import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitIdCard, KitRadio, KitSpace, KitTag} from 'aristid-ds';
import {type RadioGroupProps} from 'aristid-ds/dist/Kit/DataEntry/Radio';
import {type FunctionComponent} from 'react';

interface ISelectViewTypeProps {
    value: string;
    onChange: RadioGroupProps['onChange'];
}

export const SelectViewType: FunctionComponent<ISelectViewTypeProps> = ({value, onChange}) => {
    const {t} = useSharedTranslation();

    const comingSoonTag = (
        <KitTag type="secondary">
            <KitIdCard description={String(t('explorer.coming-soon'))} />
        </KitTag>
    );

    return (
        <KitRadio.Group value={value} onChange={onChange}>
            <KitSpace direction="vertical" size={0}>
                <KitRadio value="table">{t('explorer.view-type-table')}</KitRadio>
                <KitRadio value="timeline">{t('explorer.view-type-planning')}</KitRadio>
                <KitRadio value="list" disabled>
                    <KitSpace>
                        {t('explorer.view-type-list')} {comingSoonTag}
                    </KitSpace>
                </KitRadio>
                <KitRadio value="mosaic" disabled>
                    <KitSpace>
                        {t('explorer.view-type-mosaic')} {comingSoonTag}
                    </KitSpace>
                </KitRadio>
            </KitSpace>
        </KitRadio.Group>
    );
};
