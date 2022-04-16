#!/usr/bin/env node
const yargs = require('yargs');
const usage = '\nUsage: sern init';
yargs
	.usage(usage)
	.option('i', {
		describe: 'Set up basic project without any customizations',
		boolean: true,
	})
	.help(true).argv;
