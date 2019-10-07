import React from 'react';
import ALCCard from '../ALCReserveCard';
import {Header} from 'semantic-ui-react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {IReserveAction, IColorDic, IAction} from '../interfaces/interfaces';
import {AvailableActionsContainer} from '../stylesComps';

//////////////////// INTERFACES

interface IALCReserveProps extends WithNamespaces {
    actions: IReserveAction[] | null;
    setCurrentIndex: (index: number) => void;
    colorTypeDictionnary: IColorDic;
    addActionToList: (actionName: string, atIndex: number) => void;
}

//////////////////// COMPONENT

function ALCReserve({
    actions,
    setCurrentIndex,
    colorTypeDictionnary,
    addActionToList,
    t
}: IALCReserveProps): JSX.Element {
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

export default withNamespaces()(ALCReserve);
