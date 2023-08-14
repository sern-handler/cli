const declareConstType = (name: string, type: string) => String.raw`declare var ${name}: ${type}`

const processEnvType = (env: NodeJS.ProcessEnv) => {
    const entries = Object.keys(env)

    const envBuilder = new StringWriter()

    for(const key of entries) {
        envBuilder.tab()
        envBuilder.tab()
        envBuilder.envField(key)
    }
    return envBuilder.build()
}

const determineJSONType = (s : string) => {
    return typeof JSON.parse(s)
}


export class StringWriter {
    private fileString = "" 

    tab() {
        this.fileString+="    "
        return this;
    }

    varDecl(name: string, type: string) {
        this.fileString+=declareConstType(name, determineJSONType(type))+'\n'
        return this;
    }

    println(data: string) {
        this.fileString+=data+"\n"
        return this;
    }
    envField(key: string) {
        if(/\s|\(|\)/g.test(key)) {
            this.fileString+=`"${key}": string`
        } else {
            this.fileString+=key+ ':'+ 'string'
        }
        this.fileString+="\n"
        return this;
    }

    envFields(env: NodeJS.ProcessEnv) {
        this.fileString+=processEnvType(env);
        return this;
    }
    build() {
        return this.fileString;
    }

}
