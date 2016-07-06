'use strict';

const path = require('path');
const precinct = require('precinct');
const Base = require('./base');

class ES6 extends Base {
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

		if (/import.*from/m.test(src) || /export.*from/m.test(src)) {
			return precinct(src, 'es6').map((id) => {
				return this.normalize(this.resolve(path.dirname(filename), id));
			});
		}

		return [];
	}
}

module.exports = ES6;
