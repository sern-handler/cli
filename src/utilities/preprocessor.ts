const declareConstType = (name: string, type: string) => String.raw`declare var ${name}: ${type}`;

const processEnvType = (env: NodeJS.ProcessEnv) => {
    const entries = Object.keys(env);

    const envBuilder = new StringWriter();

    for (const key of entries) {
        envBuilder.tab()
                  .tab()
                  .envField(key);
    }
    return envBuilder.build();
};

const determineJSONType = (s: string) => {
    return typeof JSON.parse(s);
};

type FileWriter = (path: string, content: string, format: BufferEncoding) => Promise<void>;
const writeAmbientFile = async (path: string, define: Record<string, string>, writeFile: FileWriter) => {
    const fileContent = new StringWriter();
    for (const [k, v] of Object.entries(define)) {
        fileContent.varDecl(k, v);
    }
    fileContent
        .println('declare namespace NodeJS {')
        .tab()
        .println('interface ProcessEnv {')
        .envFields(process.env)
        .tab()
        .println('}')
        .println('}');

    await writeFile(path, fileContent.build(), 'utf8');
};

const writeTsConfig = async (format: 'cjs' | 'esm', configPath: string, fw: FileWriter) => {
    //maybe better way to do this
    const target = format === 'esm' ? { target: 'esnext' } : {};
    const sernTsConfig = {
        compilerOptions: {
            //module determines top level await. CJS doesn't have that abliity afaik
            module: format === 'cjs' ? 'node' : 'esnext',
            moduleResolution: 'node16',
            strict: true,
            skipLibCheck: true,
            ...target,
            rootDirs: ['./generated', '../src'],
        },
        include: ['./ambient.d.ts', '../src'],
    };

    await fw(configPath, JSON.stringify(sernTsConfig, null, 3), 'utf8');
};
class StringWriter {
    private fileString = '';

    tab() {
        this.fileString += '    ';
        return this;
    }

    varDecl(name: string, type: string) {
        this.fileString += declareConstType(name, determineJSONType(type)) + '\n';
        return this;
    }

    println(data: string) {
        this.fileString += data + '\n';
        return this;
    }
    envField(key: string) {
        //if env field has space or parens, wrap key in ""
        if (/\s|\(|\)/g.test(key)) {
            this.fileString += `"${key}": string`;
        } else {
            this.fileString += key + ':' + 'string';
        }
        this.fileString += '\n';
        return this;
    }

    envFields(env: NodeJS.ProcessEnv) {
        this.fileString += processEnvType(env);
        return this;
    }
    build() {
        return this.fileString;
    }
}

export { writeAmbientFile, writeTsConfig };
