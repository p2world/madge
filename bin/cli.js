#!/usr/bin/env node

'use strict';

const fs = require('fs');
const version = require('../package.json').version;
const program = require('commander');
const printResult = require('../lib/print');
const madge = require('../lib/madge');

program
	.version(version)
	.usage('[options] <file|dir ...>')
	.option('-c, --config <filename>', 'use configuration from this file instead of .madgerc')
	.option('--format <name>', 'format to parse (amd/cjs/es6)', 'cjs')
	.option('--list', 'show list of all dependencies (default)')
	.option('--circular', 'show circular dependencies')
	.option('--summary', 'show summary of all dependencies')
	.option('--json', 'show list of dependencies as JSON')
	.option('--image <filename>', 'write graph to file as a PNG image')
	.option('--dot', 'show graph using the DOT language')
	.option('--no-color', 'disable color in output and image', false)
	.option('--stdin', 'skip scanning folders and read JSON from STDIN')
	.option('--debug', 'output debugging information')
	.parse(process.argv);

if (!program.args.length && !program.read && !program.requireConfig) {
	console.log(program.helpInformation());
	process.exit(1);
}

let src = program.args;

// Check config file
if (program.config && fs.existsSync(program.config)) { // eslint-disable-line no-sync
	const configOptions = JSON.parse(fs.readFileSync(program.config, 'utf8')); // eslint-disable-line no-sync
	// Duck punch the program with the new options
	// Config file take precedence
	for (const k in configOptions) {
		if (configOptions.hasOwnProperty(k)) {
			program[k] = configOptions[k];
		}
	}
}

// Read from standard input
if (program.read) {
	let buffer = '';
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', (chunk) => {
		buffer += chunk;
	});
	process.stdin.on('end', () => {
		src = JSON.parse(buffer);
		run();
	});
} else {
	run();
}

function run() {
	// Start parsing
	const res = madge(src, {
		format: program.format,
		breakOnError: program.breakOnError,
		exclude: program.exclude,
		optimized: program.optimized,
		requireConfig: program.requireConfig,
		mainRequireModule: program.mainRequireModule,
		paths: program.paths ? program.paths.split(',') : undefined,
		extensions: program.extensions.split(',').map((str) => '.' + str),
		findNestedDependencies: program.findNestedDependencies
	});

	// Ouput summary
	if (program.summary) {
		printResult.summary(res.obj(), {
			colors: program.colors,
			output: program.output
		});
	}

	// Output circular dependencies
	if (program.circular) {
		printResult.circular(res.circular(), {
			colors: program.colors,
			output: program.output
		});
	}

	// Output module dependencies
	if (program.depends) {
		printResult.depends(res.depends(program.depends), {
			colors: program.colors,
			output: program.output
		});
	}

	// Write image
	if (program.image) {
		res.image({
			colors: program.colors,
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

	// Output DOT
	if (program.dot) {
		process.stdout.write(res.dot());
	}

	// Output JSON
	if (program.json) {
		process.stdout.write(JSON.stringify(res.tree) + '\n');
	}

	// Output text (default)
	if (program.list || (!program.summary && !program.circular && !program.depends && !program.image && !program.dot && !program.json)) {
		printResult.list(res.obj(), {
			colors: program.colors,
			output: program.output
		});
	}
}
