/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('ES6', () => {
	const dir = __dirname + '/files/es6';

	it('should find circular dependencies', () => {
		madge(dir + '/circular/a.js', {dir: dir})
			.circular().getArray().should.eql([
				['circular/a.js', 'circular/b.js', 'circular/c.js']
			]);
	});

	it('should tackle errors in files', () => {
		madge(dir + '/error.js', {dir: dir})
			.obj().should.eql({
				'error.js': []
			});
	});

	it('should find absolute imports from the root', () => {
		madge(dir + '/absolute.js', {dir: dir})
			.obj().should.eql({
				'absolute.js': ['absolute/a.js'],
				'absolute/a.js': []
			});
	});

	it('should find imports on files with ES7', () => {
		madge(dir + '/async.js', {dir: dir})
			.obj().should.eql({
				'absolute/b.js': [],
				'async.js': ['absolute/b.js']
			});
	});

	it('should support export x from "./file"', () => {
		madge(dir + '/re-export/c.js', {dir: dir})
			.obj().should.eql({
				're-export/a.js': [],
				're-export/b-default.js': ['re-export/a.js'],
				're-export/b-named.js': ['re-export/a.js'],
				're-export/b-star.js': ['re-export/a.js'],
				're-export/c.js': [
					're-export/b-default.js',
					're-export/b-named.js',
					're-export/b-star.js'
				]
			});
	});

	it('should find imports on files with JSX content', () => {
		madge(dir + '/jsx.js', {dir: dir})
			.obj().should.eql({
				'jsx.js': ['absolute/b.js'],
				'absolute/b.js': []
			});
	});

	it('should find import in JSX files', () => {
		madge(dir + '/jsx/basic.jsx', {dir: dir})
			.obj().should.eql({
				'jsx/basic.jsx': ['jsx/other.jsx'],
				'jsx/other.jsx': []
			});
	});
});


// 	// it('should be able to exclude modules', () => {
// 	// 	madge(__dirname + '/files/es6/normal', {
// 	// 		exclude: '^sub',
// 	// 		format: 'es6'
// 	// 	}).obj().should.eql({'a': [], 'd': [], 'fancy-main/not-index': []});

// 	// 	madge(__dirname + '/files/es6/normal', {
// 	// 		exclude: '.*\/c$',
// 	// 		format: 'es6'
// 	// 	}).obj().should.eql({'a': ['sub/b'], 'd': [], 'sub/b': [], 'fancy-main/not-index': []});
// 	// });
