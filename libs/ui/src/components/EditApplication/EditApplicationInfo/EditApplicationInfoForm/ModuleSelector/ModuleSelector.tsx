// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, FormItemProps} from 'antd';
import {KitSelect} from 'aristid-ds';
import styled from 'styled-components';
import {themeVars} from '../../../../../antdTheme';
import {useSharedTranslation} from '../../../../../hooks/useSharedTranslation';
import {useGetApplicationModulesQuery} from '../../../../../_gqlTypes';

const OptionLabel = styled.div`
    font-weight: bold;
`;

const OptionDescription = styled.div`
    color: ${themeVars.secondaryTextColor};
`;

interface IModuleSelectorProps extends FormItemProps {
    disabled: boolean;
}

function ModuleSelector({disabled, ...itemProps}: IModuleSelectorProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {loading, data} = useGetApplicationModulesQuery();
    const form = Form.useFormInstance();
    const selectedModule = Form.useWatch('module', form);

    const modules = data?.applicationsModules ?? [];
    const options = modules.map(module => ({
        label: module.id,
        value: module.id,
        description: module.description
    }));
    const helper = modules.find(m => m.id === selectedModule)?.description;

    return (
        <Form.Item {...itemProps}>
            <KitSelect
                label={t('applications.module')}
                loading={loading}
                disabled={disabled}
                aria-label={t('applications.module')}
                options={options}
                helper={helper}
            />
        </Form.Item>
    );
}

export default ModuleSelector;
