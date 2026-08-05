import {type NavigateFunction} from 'react-router-dom';
import {type CreationPanels} from '../../../types';
import {mapperToCreationActions} from '../mapperToCreationActions';

describe('mapperToCreationActions', () => {
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

    it('maps entries to primary actions preserving config order and localizing labels', () => {
        const navigate = vi.fn() as NavigateFunction;

        const actions = mapperToCreationActions({creationPanels, lang: ['en'], navigate});

        expect(actions.map(action => action.label)).toEqual(['Create a simple UB', 'From a model']);
    });

    it('renders each entry icon with the fa-solid string notation', () => {
        const navigate = vi.fn() as NavigateFunction;

        const [defaultIcon, configuredIcon] = mapperToCreationActions({creationPanels, lang: ['fr'], navigate});

        expect(defaultIcon.icon.props.icon).toBe('fa-solid fa-plus');
        expect(configuredIcon.icon.props.icon).toBe('fa-solid fa-copy');
    });

    it('navigates to the creation panel as a top-level popup creation when the action is triggered', () => {
        const navigate = vi.fn() as NavigateFunction;
        const actions = mapperToCreationActions({creationPanels, lang: ['fr'], navigate});

        actions[1].callback();

        // NEW_RECORD_ID sentinel in the :recordId slot + forced popup + the entry id as panel id.
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('newRecord/popup/create-from-model');
    });
});
