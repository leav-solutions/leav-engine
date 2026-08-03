import {isKanbanViewEnabled} from '../kanbanViewGate';
import {type Application} from '../../types';

const applicationWithFlags = (flags: Pick<Application, 'enableViewSettings' | 'enableKanbanView'>): Application => ({
    workspaces: [],
    libraries: {},
    ...flags,
});

describe('isKanbanViewEnabled', () => {
    it('enables kanban only when BOTH enableViewSettings and enableKanbanView are on', () => {
        // Both flags on: the only enabling combination.
        expect(isKanbanViewEnabled(applicationWithFlags({enableViewSettings: true, enableKanbanView: true}))).toBe(
            true,
        );

        // enableKanbanView alone is not enough: kanban is built on the V2 views system.
        expect(isKanbanViewEnabled(applicationWithFlags({enableViewSettings: false, enableKanbanView: true}))).toBe(
            false,
        );

        // enableViewSettings alone keeps kanban gated.
        expect(isKanbanViewEnabled(applicationWithFlags({enableViewSettings: true, enableKanbanView: false}))).toBe(
            false,
        );
    });

    it('defaults to OFF when the flag is absent from the config or the application is not loaded yet', () => {
        // Flag undeclared in the JSON config (the default state of every existing instance).
        expect(isKanbanViewEnabled(applicationWithFlags({enableViewSettings: true}))).toBe(false);

        // Application settings not loaded (context still null).
        expect(isKanbanViewEnabled(null)).toBe(false);
        expect(isKanbanViewEnabled(undefined)).toBe(false);
    });
});
