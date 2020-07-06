import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Dropdown, Icon} from 'semantic-ui-react';

interface IView {
    value: number;
    text: string;
    type: string;
}

const defaultViews: IView[] = [
    {value: 0, text: 'My view list 1', type: 'list'},
    {value: 1, text: 'My view list 2', type: 'list'},
    {value: 2, text: 'My view tile 3', type: 'tile'},
    {value: 3, text: 'My view list 4', type: 'list'},
    {value: 4, text: 'My view tile 5', type: 'tile'}
];

function SelectView(): JSX.Element {
    const {t} = useTranslation();

    const [views] = useState(defaultViews);
    const [currentView, setCurrentView] = useState<IView>();

    const changeView = (view: IView) => {
        setCurrentView(view);
    };

    return (
        <Dropdown text={currentView?.text ?? t('select-view.default-view')}>
            <Dropdown.Menu>
                {views.map(view => (
                    <Dropdown.Item key={view.value} value={view.value} onClick={() => changeView(view)}>
                        <Icon name={view.type === 'list' ? 'sidebar' : 'th large'} />
                        {view.text}
                    </Dropdown.Item>
                ))}

                <Dropdown.Divider />
                <Dropdown.Item>
                    <span>
                        <Icon name="plus" />
                        <Icon name="sidebar" />
                    </span>
                    {t('select-view.add-view-list')}
                </Dropdown.Item>
                <Dropdown.Item>
                    <span>
                        <Icon name="plus" />
                        <Icon name="th large" />
                    </span>
                    {t('select-view.add-view-tile')}
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default SelectView;
