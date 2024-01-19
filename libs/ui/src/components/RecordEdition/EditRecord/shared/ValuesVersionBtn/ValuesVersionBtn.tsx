// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, ButtonProps, Dropdown, Space} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import {MenuItemType} from 'rc-menu/lib/interface';
import {VscLayers, VscLayersActive} from 'react-icons/vsc';
import {themeVars} from '_ui/antdTheme';
import {BasicButton} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types/values';
import {getValueVersionLabel} from '_ui/_utils';
import {FieldScope} from '../../_types';

interface IValuesVersionBtnProps extends Omit<ButtonProps, 'value'> {
    versions: {[scope in FieldScope]: IValueVersion};
    activeScope: FieldScope;
    onScopeChange: (scope: FieldScope) => void;
    basic?: boolean;
}

function ValuesVersionBtn({
    versions,
    activeScope,
    onScopeChange,
    basic,
    ...buttonProps
}: IValuesVersionBtnProps): JSX.Element {
    const {t} = useSharedTranslation();
    const hasInheritedVersion = !!versions[FieldScope.INHERITED];

    const _handleVersionSelect: MenuItemType['onClick'] = item => {
        item.domEvent.preventDefault();
        item.domEvent.stopPropagation();

        onScopeChange(item.key as FieldScope);
    };

    const currentVersionLabel = getValueVersionLabel(versions[FieldScope.CURRENT]);
    const iconProps = {
        size: '1.8em',
        style: {
            paddingTop: '5px'
        }
    };
    const icon = activeScope === FieldScope.CURRENT ? <VscLayersActive {...iconProps} /> : <VscLayers {...iconProps} />;
    const menuItems: ItemType[] = [
        {
            key: FieldScope.CURRENT,
            label: (
                <Space style={{paddingLeft: hasInheritedVersion ? '1rem' : 0}}>
                    {icon}
                    {currentVersionLabel}
                </Space>
            ),
            onClick: _handleVersionSelect
        }
    ];

    if (hasInheritedVersion) {
        const inheritedVersionLabel =
            getValueVersionLabel(versions[FieldScope.INHERITED]) + ` (${t('values_version.inherited_value')})`;

        const inheritedIconProps = {
            size: '1.8em',
            style: {
                paddingTop: '5px',
                color: themeVars.inheritedValuesVersionColor
            }
        };

        const inheritedIcon =
            activeScope === FieldScope.INHERITED ? (
                <VscLayersActive {...inheritedIconProps} />
            ) : (
                <VscLayers {...inheritedIconProps} />
            );
        menuItems.unshift({
            key: FieldScope.INHERITED,
            label: (
                <Space>
                    {inheritedIcon}
                    {inheritedVersionLabel}
                </Space>
            ),
            onClick: _handleVersionSelect
        });
    }

    const buttonIcon = <VscLayers size="1.35em" style={{paddingTop: '3px'}} />;
    const button = basic ? (
        <BasicButton aria-label="values-version" shape="circle" {...buttonProps} icon={buttonIcon} centered />
    ) : (
        <Button aria-label="values-version" shape="circle" {...buttonProps} icon={buttonIcon} />
    );

    return (
        <Dropdown trigger={['click']} menu={{items: menuItems, activeKey: activeScope}} overlayStyle={{zIndex: 1000}}>
            {button}
        </Dropdown>
    );
}

export default ValuesVersionBtn;
