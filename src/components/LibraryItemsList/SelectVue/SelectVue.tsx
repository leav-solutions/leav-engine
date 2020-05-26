import React, {useState} from 'react';
import {Dropdown, Icon} from 'semantic-ui-react';

const defaultVues = [
    {value: 1, text: 'My vue list 2', type: 'list'},
    {value: 2, text: 'My vue list 3', type: 'list'},
    {value: 3, text: 'My vue list 4', type: 'list'},
    {value: 4, text: 'My vue tile 5', type: 'tile'}
];

function SelectVue(): JSX.Element {
    const [vues] = useState(defaultVues);
    const [currentVue, setCurrentVue] = useState<any>();

    return (
        <Dropdown
            value={currentVue}
            onChange={(e, {value}) => {
                console.log(value, currentVue);
                setCurrentVue(value);
            }}
            placeholder="Default view..."
        >
            <Dropdown.Menu>
                {vues.map(vue => (
                    <Dropdown.Item key={vue.value} value={vue.value}>
                        <Icon name={vue.type === 'list' ? 'sidebar' : 'th large'} />
                        {vue.text}
                    </Dropdown.Item>
                ))}

                <Dropdown.Divider />
                <Dropdown.Item>
                    <span>
                        <Icon name="plus" />
                        <Icon name="sidebar" />
                    </span>
                    Add vue list
                </Dropdown.Item>
                <Dropdown.Item>
                    <span>
                        <Icon name="plus" />
                        <Icon name="th large" />
                    </span>
                    Add vue tile
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default SelectVue;
