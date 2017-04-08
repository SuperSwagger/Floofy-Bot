let slotmachine = [[], [], []], slotX, slotY;
const slotItems = ['💰', '🍋', '🐌', '👻', '🍄', '💎', '🚀', '🌸', '🍆', '👽', '🌟', '🍒', '🆓', '🔥', '🌈'];

function randomNumber(min, max) {
	return Math.floor((Math.random() * max) + min);
}

function randSlotMachine() {
	for (slotX = 0; slotX < 3; slotX++) {
		for (slotY = 0; slotY < 3; slotY++) {
			slotmachine[slotX][slotY] = slotItems[randomNumber(0, slotItems.length - 1)];
		}
	}
	var chance = randomNumber(0, 6);
	if (chance >= 3) {
		if (slotmachine[1][0] === slotmachine[1][1]) slotmachine[1][2] = slotmachine[1][0];
		else if (slotmachine[1][0] === slotmachine[1][2]) slotmachine[1][1] = slotmachine[1][0];
		else if (slotmachine[1][1] === slotmachine[1][2]) slotmachine[1][0] = slotmachine[1][1];
	}
}

const { client } = require('../bot.js');

module.exports = () => {
	client.log.logFunc('randSlotMachine');
	randSlotMachine();
	return slotmachine;
};
