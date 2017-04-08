// Credits: https://poyoarya.github.io/john
const { Command } = require('discord.js-commando');

const prep = [
	'I lost because',
	'I only lost because',
	'He won because',
	'He only won because'
];

const subjects = [
	'I was holding my controller upside down',
	'I was distracted by your body odor',
	'my parents were telling me to do chores midmatch',
	'my TV turned off in our match',
	'you did the cheap thing',
	'I was distracted by my handsome character',
	'you played boring',
	'I tried to play honest and fair',
	'I was holding my controller upside down',
	'the oven was going off',
	'my router somehow caught on fire',
	'my internet service was shut off midgame',
	'my cat walked in front of the tv',
	'my controller started melting',
	'my controller was too sweaty',
	'I SD\'d ',
	'I SD\'d and you didnt give a polite SD as well',
	'your character is broken and needs to be banned',
	'I was thinking of how cheap and broken Bayonetta is',
	'I went easy on you',
	'I broke my finger midgame',
	'my TV fell over',
	'the crowd was too loud and hurt my feelings',
	'I felt bad for you',
	'I was sleepy',
	'I was tired and couldn\'t focus',
	'the voices in my head were distracting me',
	'I was playing outside and it started raining',
	'my game is lagging more than yours',
	'my girlfriend slapped me mid match',
	'my girlfriend spilled coke on me',
	'my cat rubbed against the heater and melted his face onto it',
	'my girlfriend is going into labor',
	'my cat got stuck in the diskwasher',
	'I needed to go to KFC because it was closing in 10 minutes',
	'my little brother threw our cat in the blender',
	'woodpecker was attacking my house',
	'an earthquake messed up my inputs',
	'I got pulled over',
	'my sister got stuck in the oven',
	'my dog pissed on the ceiling',
	'my controller stopped working',
	'my hands were cold',
	'my dog was humping my leg',
	'I picked the wrong color for my character',
	'the damage ratio was 0.9',
	'the damage ratio was 1.1',
	'a tornado destroyed my Wii U',
	'my gamepad was low on battery',
	'the sun was in my eye',
	'it\'s hot in my room',
	'my volume wasn\'t on',
	'he won',
	'he got lucky',
	'he played too stupid to read',
	'lightning struck my house',
	'someone broke in my house',
	'the stars weren\'t aligned properly',
	'his character is unfair',
	'my character is low tier',
	'of rage',
	'the moon\'s gravitational forces acted on my controller',
	'a meteor distracted me'
];

function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min); // eslint-disable-line no-mixed-operators
}

function generate() {
	const finalPrep = prep[getRandInt(0, prep.length - 1)];
	const finalSubject = subjects[getRandInt(0, subjects.length - 1)];
	return `${finalPrep} ${finalSubject}.`;
}


module.exports = class JohnCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'john',
			group: 'fun',
			memberName: 'john',
			description: 'Have a random Smash john to excuse yourself for losing.'
		});
	}

	async run(msg) {
		return msg.say(generate());
	}
};
