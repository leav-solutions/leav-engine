import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header} from 'semantic-ui-react';
import ALCCard from '../ALCReserveCard';
import {IAction, IColorDic, IReserveAction} from '../interfaces/interfaces';
import {AvailableActionsContainer} from '../stylesComps';

//////////////////// INTERFACES

interface IALCReserveProps {
    actions: IReserveAction[] | null;
    setCurrentIndex: (index: number) => void;
    colorTypeDictionnary: IColorDic;
    addActionToList: (actionName: string, atIndex: number) => void;
}

//////////////////// COMPONENT

function ALCReserve({actions, setCurrentIndex, colorTypeDictionnary, addActionToList}: IALCReserveProps): JSX.Element {
    const {t} = useTranslation();
    //////////////////// RENDER

    const renderActions = (action: IReserveAction, i: number) => {
        const actualAction: IAction = {...action, id: -1, isSystem: false};

        return (
            <ALCCard
                key={i}
                id={`${i}`}
                action={actualAction}
                addActionToList={addActionToList}
                origin="ALCReserve"
                setCurrentIndex={setCurrentIndex}
                colorTypeDictionnary={colorTypeDictionnary}
            />
        );
    };

    return (
        <>
            <Header as="h4">{t('attributes.available_actions')}</Header>
            <AvailableActionsContainer>
                {actions && actions.length > 0
                    ? actions.map((action: IReserveAction, i: number) => renderActions(action, i))
                    : t('attributes.no_available_action')}
            </AvailableActionsContainer>
        </>
    );
}

export default ALCReserve;
