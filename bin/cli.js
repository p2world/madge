#!/usr/bin/env node

'use strict';

const fs = require('fs');
const version = require('../package.json').version;
const program = require('commander');
const printResult = require('../lib/print');
const madge = require('../lib/madge');

program
	.version(version)
	.usage('[options] <file>')
	.option('--dir <path>', '')
	.option('--config <filename>', 'use configuration from this file instead of .madgerc')
	.option('--list', 'show list of all dependencies (default)')
	.option('--summary', 'show summary of all dependencies')
	.option('--json', 'show list of dependencies as JSON')
	.option('--circular', 'show circular dependencies')
	.option('--depends', 'show modules that depends on the given id')
	.option('--image <filename>', 'write graph to file as a PNG image')
	.option('--dot', 'show graph using the DOT language')
	.option('--no-color', 'disable color in output and image', false)
	.parse(process.argv);

if (!program.args.length) {
	console.log(program.helpInformation());
	process.exit(1);
}

const res = madge(program.args[0], {
	dir: program.dir
});

if (program.list || (!program.summary && !program.circular && !program.depends && !program.image && !program.dot && !program.json)) {
	printResult.list(res.obj(), {
		colors: program.color,
		output: program.output
	});
}


if (program.summary) {
	printResult.summary(res.obj(), {
		colors: program.color,
		output: program.output
	});
}

if (program.json) {
	process.stdout.write(JSON.stringify(res.tree) + '\n');
}

if (program.circular) {
	printResult.circular(res.circular(), {
		colors: program.color,
		output: program.output
	});
}

if (program.depends) {
	printResult.depends(res.depends(program.depends), {
		colors: program.color,
		output: program.output
	});
}

if (program.image) {
	res.image({
		colors: program.color,
		layout: program.layout,
		fontFace: program.font,
		fontSize: program.fontSize,
		imageColors: program.imageColors
	}, (image) => {
		fs.writeFile(program.image, image, (err) => {
			if (err) {
				throw err;
			}
		});
	});
}

if (program.dot) {
	process.stdout.write(res.dot());
}
