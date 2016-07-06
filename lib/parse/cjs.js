'use strict';

const path = require('path');
const precinct = require('precinct');
const Base = require('./base');
const natives = process.binding('natives');

class CJS extends Base {
	/**
	 * Normalize a module file path and return a proper identificator.
	 * @param  {String} filename
	 * @return {String}
	 */
	normalize(filename) {
		filename = this.replaceBackslashInPath(filename);
		if (filename.charAt(0) !== '/' && !filename.match(/^[A-Za-z:]+\//i)) {
			// a core module (not mapped to a file)
			return filename;
		}
		return super.normalize(filename);
	}

	/**
	 * Parse the given file and return all found dependencies.
	 * @param  {String} filename
	 * @return {Array}
	 */
	parseFile(filename) {
		const src = this.getFileSource(filename);

		this.emit('parseFile', {
			filename: filename,
			src: src
		});

		if (/require\s*\(/m.test(src)) {
			return precinct(src, 'commonjs')
				.filter((id) => this.opts.commonjs.includeCore || !natives[id])
				.map((id) => this.normalize(this.resolve(path.dirname(filename), id)))
				.filter((id) => this.opts.commonjs.includeNpm || id.indexOf('node_modules') < 0);
		}

		return [];
	}
}

module.exports = CJS;
