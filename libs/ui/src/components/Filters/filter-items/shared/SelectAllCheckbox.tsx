import {type FunctionComponent} from 'react';
import {KitCheckbox, KitSpace, KitTree} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import styled from 'styled-components';

interface ISelectAllCheckboxProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: (nextChecked: boolean) => void;
}

const TreeStyled = styled(KitTree)`
    font-style: italic;
`;

const SELECT_ALL_KEY = 'select-all';

export const SelectAllCheckbox: FunctionComponent<ISelectAllCheckboxProps> = ({checked, indeterminate, onChange}) => {
    const {t} = useSharedTranslation();

    const handleChange = () => {
        onChange(!checked);
    };

    return (
        <TreeStyled
            treeData={[
                {
                    title: (
                        <KitSpace direction="horizontal" size="xs">
                            <KitCheckbox checked={checked} indeterminate={indeterminate} onChange={handleChange} />
                            {t('filters.select-all')}
                        </KitSpace>
                    ),
                    key: SELECT_ALL_KEY,
                    isLeaf: true,
                },
            ]}
            checkedKeys={checked ? [SELECT_ALL_KEY] : []}
            selectedKeys={checked ? [SELECT_ALL_KEY] : []}
            onSelect={handleChange}
            onCheck={handleChange}
        />
    );
};
