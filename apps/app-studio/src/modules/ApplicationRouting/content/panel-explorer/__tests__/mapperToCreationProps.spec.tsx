import {type NavigateFunction} from 'react-router-dom';
import {type CreationPanels} from '../../../types';
import {mapperToCreationProps} from '../mapperToCreationProps';

describe('mapperToCreationProps', () => {
    const creationPanels: CreationPanels = [
        {
            id: 'create-simple',
            type: 'creationForm',
            formId: 'creation',
            name: {fr: 'Créer une UB simple', en: 'Create a simple UB'},
            // The schema defaults `icon` to fa-plus, so the mapper always receives one.
            icon: 'fa-plus',
            isStandalone: true,
        },
        {
            id: 'create-from-model',
            type: 'creationForm',
            formId: 'creation_model',
            name: {fr: 'À partir d’un modèle', en: 'From a model'},
            icon: 'fa-copy',
            isStandalone: true,
        },
    ];

    it('returns no props when no creationPanel is declared, leaving the built-in create untouched', () => {
        const navigate = vi.fn() as NavigateFunction;

        expect(mapperToCreationProps({creationPanels: [], lang: ['fr'], navigate})).toEqual({});
    });

    it('maps entries to primary actions preserving config order and localizing labels', () => {
        const navigate = vi.fn() as NavigateFunction;

        const {primaryActions} = mapperToCreationProps({creationPanels, lang: ['en'], navigate});

        expect(primaryActions.map(action => action.label)).toEqual(['Create a simple UB', 'From a model']);
    });

    it('disables the explorer built-in create with a render-stable defaultPrimaryActions reference', () => {
        const navigate = vi.fn() as NavigateFunction;

        const firstRender = mapperToCreationProps({creationPanels, lang: ['fr'], navigate});
        const secondRender = mapperToCreationProps({creationPanels, lang: ['fr'], navigate});

        expect(firstRender.defaultPrimaryActions).toEqual([]);
        expect(secondRender.defaultPrimaryActions).toBe(firstRender.defaultPrimaryActions);
    });

    it('renders each entry icon with the fa-solid string notation', () => {
        const navigate = vi.fn() as NavigateFunction;

        const {
            primaryActions: [defaultIcon, configuredIcon],
        } = mapperToCreationProps({creationPanels, lang: ['fr'], navigate});

        expect(defaultIcon.icon.props.icon).toBe('fa-solid fa-plus');
        expect(configuredIcon.icon.props.icon).toBe('fa-solid fa-copy');
    });

    it('navigates to the creation panel as a top-level popup creation when the action is triggered', () => {
        const navigate = vi.fn() as NavigateFunction;
        const {primaryActions} = mapperToCreationProps({creationPanels, lang: ['fr'], navigate});

        primaryActions[1].callback();

        // NEW_RECORD_ID sentinel in the :recordId slot + forced popup + the entry id as panel id.
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('newRecord/popup/create-from-model');
    });

    it('forwards the link context of the opener as the formInitialValues query param', () => {
        const navigate = vi.fn() as NavigateFunction;
        const {primaryActions} = mapperToCreationProps({
            creationPanels,
            lang: ['fr'],
            navigate,
            initialValues: {offers_campaign: ['42']},
        });

        primaryActions[0].callback();

        expect(navigate).toHaveBeenCalledWith(
            `newRecord/popup/create-simple?formInitialValues=${encodeURIComponent(
                JSON.stringify({offers_campaign: ['42']}),
            )}`,
        );
    });
});
