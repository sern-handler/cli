#!/usr/bin/env node
const yargs = require('yargs');

yargs.scriptName('sern');
yargs.command({
	command: 'init',
	describe: 'Initialize a new project',
	builder: {
		name: {
			describe: 'Project name',
			demandOption: true,
			type: 'string',
		},
	},
	handler: function (argv) {
		console.log('Initializing a new project...');
		console.log('Project name: ' + argv.name);
	},
}).argv;
