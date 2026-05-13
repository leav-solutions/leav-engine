#!/usr/bin/env node

const fs = require('fs');
const {parseArgs} = require('node:util');

// Parse arguments: node script.js <parent> <name>
const args = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
});
const positionals = args.positionals;
if (positionals.length < 2) {
    console.error('Usage: <parent folder> <compName>');
    process.exit(1);
}
const parent = positionals[0];
const compName = positionals[1];

const _getComponentContent = name =>
    `import React from 'react';

interface I${name}Props {

}

function ${name}({}: I${name}Props): JSX.Element {
    return (
        <div></div>
    );
}

export default ${name};`;

const _getTestContent = name =>
    `import React from 'react';
import {act, screen, render} from '_tests/testUtils';
import ${name} from './${name}';

describe('${name}', () => {
    test('Render test', async () => {
        render(<${name} />);

        //TODO: Add some real tests
        expect(screen.getByText('${name}')).toBeInTheDocument();
    });
});`;

const destDir = __dirname + '/../src/components/' + parent + '/';
const compFolder = destDir + compName;

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
    const fileContent = `import ${compName} from './${compName}';\nexport default ${compName};`;

    fs.writeFileSync(indexFile, fileContent);
}

// Create component file
const compFile = compFolder + `/${compName}.tsx`;
if (!fs.existsSync(compFile)) {
    const fileContent = _getComponentContent(compName);

    fs.writeFileSync(compFile, fileContent);
}

// Create component test file
const testFile = compFolder + `/${compName}.test.tsx`;
if (!fs.existsSync(testFile)) {
    const fileContent = _getTestContent(compName);

    fs.writeFileSync(testFile, fileContent);
}
