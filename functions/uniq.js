const prims = { boolean: {}, number: {}, string: {} }, objs = [];

module.exports = thing => {
	return thing.filter((item) => {
		const type = typeof item;
		if (type in prims) return prims[type].hasOwnProperty(item) ? false : prims[type][item] = true; // eslint-disable-line no-return-assign
		else return objs.indexOf(item) >= 0 ? false : objs.push(item);
	});
};
