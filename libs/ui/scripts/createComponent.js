#!/usr/bin/env node
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const fs = require('fs');
const prog = require('commander');

const _getComponentContent = name =>
    `import {FunctionComponent} from 'react';

interface I${name}Props {

}

export const ${name}: FunctionComponent<I${name}Props> = ({}) => {
    return (
        <div></div>
    );
};`;

const _getTestContent = name =>
    `import React from 'react';
import {act, screen, render} from '_ui/_tests/testUtils';
import {${name}} from './${name}';

describe('${name}', () => {
    test('Render test', async () => {
        render(<${name} />);

        //TODO: Add some real tests
        expect(screen.getByText('${name}')).toBeInTheDocument();
    });
});`;

prog.version('0.1.0')
    .usage('<parent folder> <compName>')
    .action((cmd, {args}) => {
        const [parent, name] = args;
        const destDir = __dirname + '/../src/components/' + parent + '/';

        const compFolder = destDir + name;

        // Create new parent folder if not existing
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir);
        }

        // Create new folder if not existing
        if (!fs.existsSync(compFolder)) {
            fs.mkdirSync(compFolder);
        }

        // Create index file
        const indexFile = compFolder + '/index.ts';
        if (!fs.existsSync(indexFile)) {
            const fileContent = `export {${name}} from './${name}';`;

            fs.writeFileSync(indexFile, fileContent);
        }

        // Create component file
        const compFile = compFolder + `/${name}.tsx`;
        if (!fs.existsSync(compFile)) {
            const fileContent = _getComponentContent(name);

            fs.writeFileSync(compFile, fileContent);
        }

        // Create component test file
        const testFile = compFolder + `/${name}.test.tsx`;
        if (!fs.existsSync(testFile)) {
            const fileContent = _getTestContent(name);

            fs.writeFileSync(testFile, fileContent);
        }
    })
    .parse(process.argv);
