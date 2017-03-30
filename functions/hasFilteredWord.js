module.exports = (filteredWords, str) => {
	return filteredWords ? filteredWords.some(word => str.toLowerCase().includes(word)) : false;
};
