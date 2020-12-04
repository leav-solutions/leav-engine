import {AppstoreFilled, MenuOutlined} from '@ant-design/icons';
import React, {useState} from 'react';
import {useStateItem} from '../../../Context/StateItemsContext';
import {IView} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

const defaultViews: IView[] = [
    {value: 0, text: 'My view list 1', type: 'list', color: '#50F0C4'},
    {value: 1, text: 'My view list 2', type: 'list', color: '#E02020'},
    {value: 2, text: 'My view tile 3', type: 'tile', color: '#7EAC56'},
    {value: 3, text: 'My view list 4', type: 'list', color: '#E4B34C'},
    {value: 4, text: 'My view tile 5', type: 'tile'}
];

function ViewPanel(): JSX.Element {
    const {dispatchItems} = useStateItem();

    const [views] = useState(defaultViews);

    const changeView = (view: IView) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_VIEW,
            view: {current: view}
        });
    };

    return (
        <div>
            {views.map(view => (
                <div key={view.value} onClick={() => changeView(view)}>
                    {view.type === 'list' ? <MenuOutlined /> : <AppstoreFilled />} {view.text}
                </div>
            ))}
        </div>
    );
}

export default ViewPanel;
