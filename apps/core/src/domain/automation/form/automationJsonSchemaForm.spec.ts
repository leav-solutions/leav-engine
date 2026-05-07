// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RJSFSchema} from '@rjsf/utils';
import {extractAndLiftDefs} from './automationJsonSchemaForm';

describe('extractAndLiftDefs', () => {
    it('returns empty defs and unchanged schema when input has no $defs or $schema', () => {
        const input: RJSFSchema = {type: 'object', properties: {name: {type: 'string'}}};

        const {schema, defs} = extractAndLiftDefs(input);

        expect(defs).toEqual({});
        expect(schema).toEqual(input);
    });

    it('strips $schema from the returned schema', () => {
        const input: RJSFSchema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'string',
        };

        const {schema, defs} = extractAndLiftDefs(input);

        expect(schema).not.toHaveProperty('$schema');
        expect(schema).toEqual({type: 'string'});
        expect(defs).toEqual({});
    });

    it('lifts $defs to the returned defs object and removes them from schema', () => {
        const input: RJSFSchema = {
            type: 'object',
            properties: {lib: {$ref: '#/$defs/library'}},
            $defs: {
                library: {type: 'string'},
            },
        };

        const {schema, defs} = extractAndLiftDefs(input);

        expect(schema).not.toHaveProperty('$defs');
        expect(defs).toEqual({library: {type: 'string'}});
    });

    it('strips the id field from each $defs entry (Zod v4 generates id via .meta({id}))', () => {
        // Zod v4 adds an `id` field on $defs entries when .meta({ id }) is used.
        // Keeping it causes AJV8 to register duplicate URI anchors when the same def
        // is $ref'd from more than one place in the assembled schema.
        const input: RJSFSchema = {
            type: 'object',
            $defs: {
                library: {id: 'library', type: 'string'} as RJSFSchema & {id: string},
                attribute: {id: 'attribute', type: 'string', minLength: 1} as RJSFSchema & {id: string},
            },
        };

        const {defs} = extractAndLiftDefs(input);

        expect(defs.library).not.toHaveProperty('id');
        expect(defs.library).toEqual({type: 'string'});
        expect(defs.attribute).not.toHaveProperty('id');
        expect(defs.attribute).toEqual({type: 'string', minLength: 1});
    });

    it('preserves $defs entries that have no id field', () => {
        const input: RJSFSchema = {
            $defs: {
                status: {type: 'string', enum: ['active', 'inactive']},
            },
        };

        const {defs} = extractAndLiftDefs(input);

        expect(defs.status).toEqual({type: 'string', enum: ['active', 'inactive']});
    });

    it('handles a realistic Zod toJSONSchema output with $schema, $defs with id, and a $ref', () => {
        // Simulates what trigger.topicSchema.toJSONSchema() produces for a library topic
        const zodOutput: RJSFSchema = {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
                library: {$ref: '#/$defs/library'},
            },
            required: ['library'],
            $defs: {
                library: {type: 'string'} as RJSFSchema & {id: string},
            },
        };

        const {schema, defs} = extractAndLiftDefs(zodOutput);

        expect(schema).not.toHaveProperty('$schema');
        expect(schema).not.toHaveProperty('$defs');
        expect(schema).toEqual({
            type: 'object',
            properties: {library: {$ref: '#/$defs/library'}},
            required: ['library'],
        });
        expect(defs).toEqual({library: {type: 'string'}});
    });
});
