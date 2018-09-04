#!/usr/bin/env node
const fs = require('fs');
const prog = require('commander');

const _getFuncCompContent = name =>
    `import * as React from 'react';

interface I${name}Props {

}

function ${name}({}: I${name}Props): JSX.Element {
    return (
        <div></div>
    );
}

export default ${name};`;

const _getClassCompContent = name =>
    `import * as React from 'react';

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
    .option('-m, --component', 'Create in components folder')
    .option('-n, --container', 'Create in containers folder')
    .option('-t, --type [type]', 'Component type (functional or class)', /^(func|class)$/i)
    .action(name => {
        const destDir = __dirname + '/../src/' + (prog.component ? 'components' : 'containers') + '/';

        const compFolder = destDir + name;

        // Create new folder if not existing
        if (!fs.existsSync(compFolder)) {
            fs.mkdirSync(compFolder);
        }

        // Create index file
        const indexFile = compFolder + '/index.ts';
        if (!fs.existsSync(indexFile)) {
            const filecontent = `import ${name} from './${name}';\nexport default ${name};`;

            fs.writeFileSync(indexFile, filecontent);
        }

        // Create component file
        const compFile = compFolder + `/${name}.tsx`;
        if (!fs.existsSync(compFile)) {
            const filecontent = prog.type === 'class' ? _getClassCompContent(name) : _getFuncCompContent(name);

            fs.writeFileSync(compFile, filecontent);
        }

        // Create component test file
        const testFile = compFolder + `/${name}.test.tsx`;
        if (!fs.existsSync(testFile)) {
            const filecontent = `import * as React from 'react';
import {create} from 'react-test-renderer';
import ${name} from './${name}';

describe('${name}', () => {
    test('Snapshot test', async () => {
        const comp = create(<${name} />);

        expect(comp).toMatchSnapshot();
    });
});`;

            fs.writeFileSync(testFile, filecontent);
        }
    })
    .parse(process.argv);
