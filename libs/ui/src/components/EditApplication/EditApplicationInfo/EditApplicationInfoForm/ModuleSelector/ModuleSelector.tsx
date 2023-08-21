// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Form, FormItemProps, Select} from 'antd';
import styled from 'styled-components';
import {themeVars} from '../../../../../antdTheme';
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
    const {loading, data} = useGetApplicationModulesQuery();

    const modules = data?.applicationsModules ?? [];

    return (
        <Form.Item {...itemProps}>
            <Select loading={loading} disabled={disabled} aria-label="">
                {modules.map(module => (
                    <Select.Option value={module.id} key={module.id}>
                        <OptionLabel>{module.id}</OptionLabel>
                        <OptionDescription>{module.description}</OptionDescription>
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>
    );
}

export default ModuleSelector;
