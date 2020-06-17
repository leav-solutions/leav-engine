import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Menu} from 'semantic-ui-react';

interface IMenuItemListSelectedProps {
    selected: {[x: string]: boolean};
    setSelected: React.Dispatch<React.SetStateAction<{[x: string]: boolean}>>;
    setModeSelection: React.Dispatch<React.SetStateAction<boolean>>;
}

function MenuItemListSelected({selected, setSelected, setModeSelection}: IMenuItemListSelectedProps): JSX.Element {
    const {t} = useTranslation();

    const [countItemsSelected, setCountItemsSelected] = useState(0);

    const disableModeSelection = () => {
        setModeSelection(false);
        setSelected({});
    };

    useEffect(() => {
        let count = 0;
        for (const itemId in selected) {
            if (selected[itemId]) {
                count++;
            }
        }

        setCountItemsSelected(count);
    }, [selected, setCountItemsSelected]);

    return (
        <>
            <Menu.Item>{t('menu-selection.nb-selected', {nb: countItemsSelected})}</Menu.Item>
            <Menu.Item>
                <Button onClick={disableModeSelection}>{t('menu-selection.quit')}</Button>
            </Menu.Item>
        </>
    );
}

export default MenuItemListSelected;
