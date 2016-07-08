/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('AMD', () => {
	const dir = __dirname + '/files/amd';

	it('should find recursive dependencies', () => {
		madge(dir + '/ok/a.js', {dir: dir})
			.obj().should.eql({
				'ok/a.js': ['ok/sub/b.js'],
				'ok/sub/b.js': []
			});
	});

	it('https://github.com/pahen/madge/issues/52', () => {
		madge(dir + '/same/b.js', {dir: dir})
			.obj().should.eql({
				'same/a.js': [],
				'same/b.js': ['same/a.js']
			});
	});

	it('should ignore plugins', () => {
		madge(dir + '/plugin.js', {dir: dir})
			.obj().should.eql({
				'ok/a.js': [
					'ok/sub/b.js'
				],
				'ok/sub/b.js': [],
				'plugin.js': ['ok/a.js']
			});
	});

	it('should find nested dependencies', () => {
		madge(dir + '/nested/main.js', {dir: dir})
			.obj().should.eql({
				'nested/a.js': [],
				'nested/b.js': [],
				'nested/main.js': [
					'nested/a.js',
					'nested/b.js'
				]
			});
	});

	it('should find circular dependencies', () => {
		madge(dir + '/circular/main.js', {dir: dir})
			.circular().getArray().should.eql([
				['circular/a.js', 'circular/c.js'],
				['circular/f.js', 'circular/g.js', 'circular/h.js']
			]);
	});

	it('should work for amd files with es6 code inside', () => {
		madge(dir + '/amdes6.js', {dir: dir})
			.obj().should.eql({
				'amdes6.js': ['ok/a.js'],
				'ok/a.js': ['ok/sub/b.js'],
				'ok/sub/b.js': []
			});
	});

	it.skip('should handle optimized files', () => {
		madge(dir + '/a-built.js', {dir: dir})
			.obj().should.eql(
				{'a': ['sub/b'], 'd': [], 'sub/b': ['sub/c'], 'sub/c': ['d']
			});
	});
});

// 	// it('should handle optimized files originating with a `require` call', () => {
// 	// 	madge(__dirname + '/files/amd/b-built.js', {
// 	// 		format: 'amd',
// 	// 		optimized: true
// 	// 	}).obj().should.eql({'': ['sub/b'], 'a': [], 'd': [], 'sub/b': ['sub/c'], 'sub/c': ['d']});
// 	// });

// 	// it('should handle optimized files originating with a `require` call and a designated main module', () => {
// 	// 	madge(__dirname + '/files/amd/b-built.js', {
// 	// 		format: 'amd',
// 	// 		optimized: true,
// 	// 		mainRequireModule: 'a'
// 	// 	}).obj().should.eql({'a': ['sub/b'], 'd': [], 'sub/b': ['sub/c'], 'sub/c': ['d']});
// 	// });

// 	// it('should merge in shim dependencies found in RequireJS config', () => {
// 	// 	madge(__dirname + '/files/amd/requirejs/a.js', {
// 	// 		format: 'amd',
// 	// 		requireConfig: __dirname + '/files/amd/requirejs/config.js'
// 	// 	}).obj().should.eql({'a': ['jquery'], 'jquery': [], 'jquery.foo': ['jquery'], 'jquery.bar': ['jquery'], 'baz': ['quux'], 'quux': []});
// 	// });

// 	// it('should be able to exclude modules', () => {
// 	// 	madge(__dirname + '/files/amd/ok', {
// 	// 		format: 'amd',
// 	// 		exclude: '^sub'
// 	// 	}).obj().should.eql({'a': [], 'd': [], 'e': []});

// 	// 	madge(__dirname + '/files/amd/ok', {
// 	// 		format: 'amd',
// 	// 		exclude: '.*\/c$'
// 	// 	}).obj().should.eql({'a': ['sub/b'], 'd': [], 'e': [], 'sub/b': []});

// 	// 	madge(__dirname + '/files/amd/requirejs/a.js', {
// 	// 		format: 'amd',
// 	// 		requireConfig: __dirname + '/files/amd/requirejs/config.js',
// 	// 		exclude: '^jquery.foo|quux$'
// 	// 	}).obj().should.eql({a: ['jquery'], 'jquery': [], 'jquery.bar': ['jquery'], 'baz': []});
// 	// });

// 	// it('should tackle errors in files', () => {
// 	// 	madge(__dirname + '/files/amd/error.js', {
// 	// 		format: 'amd'
// 	// 	}).obj().should.eql({error: []});
// 	// });

// 	// it('should handle named modules', () => {
// 	// 	madge(__dirname + '/files/amd/namedWrapped/car.js', {
// 	// 		format: 'amd'
// 	// 	}).obj().should.eql({'car': ['engine', 'wheels']});
// 	// });

// 	// it('should find circular dependencies with relative paths', () => {
// 	// 	madge(__dirname + '/files/amd/circularRelative', {
// 	// 		format: 'amd'
// 	// 	}).circular().getArray().should.eql([['a', 'foo/b']]);
// 	// });

// 	// it('should find circular dependencies with alias', () => {
// 	// 	madge(__dirname + '/files/amd/circularAlias', {
// 	// 		format: 'amd',
// 	// 		requireConfig: __dirname + '/files/amd/circularAlias/config.js'
// 	// 	}).circular().getArray().should.eql([['cpu', 'jsdos']]);
// 	// });

// 	// it('should find modules that depends on another', () => {
// 	// 	madge(__dirname + '/files/amd/ok', {
// 	// 		format: 'amd'
// 	// 	}).depends('sub/c').should.eql(['e', 'sub/b']);
// 	// });

// 	// it('should compile coffeescript on-the-fly', () => {
// 	// 	madge(__dirname + '/files/amd/coffeescript', {
// 	// 		format: 'amd'
// 	// 	}).obj().should.eql({'a': ['b'], 'b': []});
// 	// });

// 	// it('should resolve relative module indentifiers', () => {
// 	// 	madge(__dirname + '/files/amd/relative', {
// 	// 		format: 'amd'
// 	// 	}).obj().should.eql({'a': [], 'b': ['a'], 'foo/bar/d': ['a'], 'foo/c': ['a']});
// 	// });
