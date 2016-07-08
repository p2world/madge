/* eslint-env mocha */
'use strict';

const madge = require('../lib/madge');
require('should');

describe('CommonJS', () => {
	const dir = __dirname + '/files/cjs';

	it('should find recursive dependencies', () => {
		madge(dir + '/normal/a.js', {dir: dir})
			.obj().should.eql({
				'normal/a.js': ['normal/sub/b.js'],
				'normal/d.js': [],
				'normal/sub/b.js': ['normal/sub/c.js'],
				'normal/sub/c.js': ['normal/d.js']
			});
	});

	it('should find circular dependencies', () => {
		madge(dir + '/circular/a.js', {dir: dir})
			.circular().getArray().should.eql([
				['circular/a.js', 'circular/b.js', 'circular/c.js']
			]);
	});
});

// 	// it('should handle expressions in require call', () => {
// 	// 	madge(__dirname + '/files/cjs/both.js')
// 	// 		.obj().should.eql({'both': ['node_modules/a', 'node_modules/b']});
// 	// });

// 	// it('should handle require call and chained functions', () => {
// 	// 	madge(__dirname + '/files/cjs/chained.js')
// 	// 		.obj().should.eql({'chained': ['node_modules/a', 'node_modules/b', 'node_modules/c']});
// 	// });

// 	// it('should handle nested require call', () => {
// 	// 	madge(__dirname + '/files/cjs/nested.js')
// 	// 		.obj().should.eql({'nested': ['node_modules/a', 'node_modules/b', 'node_modules/c']});
// 	// });

// 	// it('should handle strings in require call', () => {
// 	// 	madge(__dirname + '/files/cjs/strings.js')
// 	// 		.obj().should.eql({strings: [
// 	// 			'events', 'node_modules/a', 'node_modules/b', 'node_modules/c',
// 	// 			'node_modules/doom', 'node_modules/events2', 'node_modules/y'
// 	// 		]});
// 	// });

// 	// it('should tackle errors in files', () => {
// 	// 	madge(__dirname + '/files/cjs/error.js')
// 	// 		.obj().should.eql({'error': []});
// 	// });

// 	// it('should be able to exclude modules', () => {
// 	// 	madge(__dirname + '/files/cjs/normal', {
// 	// 		exclude: '^sub'
// 	// 	}).obj().should.eql({'a': [], 'd': [], 'fancy-main/not-index': []});

// 	// 	madge(__dirname + '/files/cjs/normal', {
// 	// 		exclude: '.*\/c$'
// 	// 	}).obj().should.eql({'a': ['sub/b'], 'd': [], 'sub/b': [], 'fancy-main/not-index': []});
// 	// });

// 	// it('should compile coffeescript on-the-fly', () => {
// 	// 	madge(__dirname + '/files/cjs/coffeescript')
// 	// 		.obj().should.eql({'a': ['./b'], 'b': []});
// 	// });

// 	// it('should be able to exclude core modules', () => {
// 	// 	madge(__dirname + '/files/cjs/core.js', {commonjs: {includeCore: false}})
// 	// 		.obj().should.eql({core: ['node_modules/a']});
// 	// });

// 	// it('should be able to exclude NPM modules', () => {
// 	// 	madge(__dirname + '/files/cjs/npm.js', {commonjs: {includeNpm: false}})
// 	// 		.obj().should.eql({npm: ['normal/d']});
// 	// });
// });
