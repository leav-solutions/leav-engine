#!/usr/bin/env node
const fs = require('fs');
const prog = require('commander');

const _getFuncCompContent = name =>
    `import React from 'react';

interface I${name}Props {

}

function ${name}({}: I${name}Props): JSX.Element {
    return (
        <div></div>
    );
}

export default ${name};`;

const _getClassCompContent = name =>
    `import React from 'react';

interface I${name}Props {

}

interface I${name}State {

}

class ${name} extends React.Component<I${name}Props, I${name}State> {
    constructor(props: I${name}Props) {
        super(props);
    }

    public render() {
        return (
            <div></div>
        );
    }
}

export default ${name};`;

prog.version('0.1.0')
    .usage('[options] <compName>')
    .option('-P, --parent <parent>', 'Parent folder (where the components will be created)')
    .option('-t, --type [type]', 'Component type (functional or class)', /^(func|class)$/i)
    .action(name => {
        if (!prog.parent) {
            console.log('Missing --parent argument');
        }

        const destDir = __dirname + '//components/' + prog.parent + '/';

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
            const fileContent = `import ${name} from './${name}';\nexport default ${name};`;

            fs.writeFileSync(indexFile, fileContent);
        }

        // Create component file
        const compFile = compFolder + `/${name}.tsx`;
        if (!fs.existsSync(compFile)) {
            const fileContent = prog.type === 'class' ? _getClassCompContent(name) : _getFuncCompContent(name);

            fs.writeFileSync(compFile, fileContent);
        }

        // Create component test file
        const testFile = compFolder + `/${name}.test.tsx`;
        if (!fs.existsSync(testFile)) {
            const fileContent = `import React from 'react';
import {render} from 'enzyme';
import ${name} from './${name}';

describe('${name}', () => {
    test('Snapshot test', async () => {
        const comp = render(<${name} />);

        expect(comp).toMatchSnapshot();
    });
});`;

            fs.writeFileSync(testFile, fileContent);
        }
    })
    .parse(process.argv);
