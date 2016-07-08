'use strict';

const path = require('path');
const dependencyTree = require('dependency-tree');
const cyclic = require('./cyclic');
const graph = require('./graph');
const defaultConfig = require('../config.default.json');

/**
 * Convert deep tree produced by `dependency-tree` to internal format used by Madge.
 * @param  {Object} tree
 * @param  {Object} opts
 * @param  {Object} [graph]
 * @return {Object}
 */
function convertDependencyTree(tree, opts, graph) {
	graph = graph || {};

	Object.keys(tree).forEach((key) => {
		const id = stripDirFromPath(opts.dir, key);

		if (!graph[id]) {
			graph[id] = Object
				.keys(tree[key])
				.map((dep) => stripDirFromPath(opts.dir, dep));
		}

		convertDependencyTree(tree[key], opts, graph);
	});

	return graph;
}

/**
 * Strip `dir` from the given `path`.
 * @param  {String} dir
 * @param  {String} path
 * @return {String}
 */
function stripDirFromPath(dir, path) {
	return path.replace(dir + '/', '');
}

class Madge {
	/**
	 * Class constructor.
	 * @constructor
	 * @api public
	 * @param {String|Object} filename
	 * @param {Object} opts
	 */
	constructor(filename, opts) {
		this.opts = Object.assign({}, defaultConfig, opts);

		if (this.opts.dir) {
			this.opts.dir = path.resolve(this.opts.dir);
		}

		if (!filename) {
			throw new Error('Filename argument is missing');
		}

		if (filename && typeof filename === 'object') {
			this.tree = filename;
		} else {
			this.tree = convertDependencyTree(dependencyTree({
				filename: filename,
				directory: this.opts.dir || '.',
				// requireConfig: 'path/to/requirejs/config', // optional
				// webpackConfig: 'path/to/webpack/config', // optional
				filter: (path) => path.indexOf('node_modules') < 0
			}), this.opts);
		}

		this.sortDependencies();
	}

	/**
	 * Sort dependencies by name.
	 */
	sortDependencies() {
		this.tree = Object.keys(this.tree).sort().reduce((acc, id) => {
			(acc[id] = this.tree[id]).sort();
			return acc;
		}, {});
	}

	/**
	 * Return the module dependency graph as an object.
	 * @api public
	 * @return {Object}
	 */
	obj() {
		return this.tree;
	}

	/**
	 * Return the modules that has circular dependencies.
	 * @api public
	 * @return {Object}
	 */
	circular() {
		return cyclic(this.tree);
	}

	/**
	 * Return a list of modules that depends on the given module.
	 * @api public
	 * @param  {String} id
	 * @return {Array|Object}
	 */
	depends(id) {
		return Object.keys(this.tree).filter((module) => {
			if (this.tree[module]) {
				return this.tree[module].reduce((acc, dependency) => {
					if (dependency === id) {
						acc = module;
					}
					return acc;
				}, false);
			}
		});
	}

	/**
	 * Return the module dependency graph as DOT output.
	 * @api public
	 * @return {String}
	 */
	dot() {
		return graph.dot(this.tree);
	}

	/**
	 * Return the module dependency graph as a PNG image.
	 * @api public
	 * @param  {Object}   opts
	 * @param  {Function} callback
	 */
	image(opts, callback) {
		graph.image(this.tree, opts, callback);
	}
}

module.exports = (src, opts) => new Madge(src, opts);
