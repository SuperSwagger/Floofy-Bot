// Credits: https://poyoarya.github.io/john
const { Command } = require('discord.js-commando');

const prep = [
	'I lost because',
	'I only lost because',
	'He won because',
	'He only won because'
];

const subjects = [
	'my controller is',
	'the sun was',
	'my hands were',
	'everyone was',
	'the TV is',
	'the crowd was',
	'my opponent was',
	'my chair is',
	'his controller is',
	'Meta Knight is',
	"Roy's wavedash is",
	'my mother is',
	'my brain is',
	'my 3DS is',
	'Nintendo was',
	'my Twitter followers were',
	'my eyes are',
	'the DLC is',
	'the commentators are',
	'the music was',
	'Final Destination is',
	'Reggie Fils-Aim\u00e9 is',
	'the venue is',
	'my skills were',
	'the stream was',
	'Sakurai was',
	'the ledge was',
	'my foot is',
	'the C-stick was',
	'Project M is',
	'your shoes are',
	"my mother's basement is",
	'the USA is',
	'tap jump was',
	'Jigglypuff was',
	'I was',
	'PAC-MAN was',
	'Alex Strife is',
	'my scarf is',
	'the T.O. is',
	'EVO was',
	'Leffen was'
];

const problems = [
	'in my eyes',
	'broken',
	'laggy',
	'hacked',
	'too loud',
	'uncomfortable',
	'OP',
	'fraudulent',
	'disturbing me',
	'making me SD',
	'upside-down',
	'violating the rules',
	'totally spooking me out',
	'unnecessarily rude',
	'making funny faces at me',
	'trash-talking mid-match',
	'running a company for 16 hours a day',
	'making excuses',
	'spamming projectiles',
	'not fair',
	'way better than my character',
	'speaking Japanese',
	'too bright',
	'nerfed',
	'garbage',
	'not good enough',
	'reminding me of my ex',
	'really annoying',
	'a big gimmick',
	'kinda sweaty',
	'not listening to me',
	'sleeping',
	'terrible for my character',
	'taunting',
	'cheating',
	'using glitches',
	'too hard to reach',
	'using better moves than me',
	'using motion controls',
	'sitting slightly closer to the screen',
	'not wearing his glasses',
	'sober',
	'using items',
	'not letting me grab him',
	'shielding too much',
	'air dodging',
	'rolling',
	'pausing mid-match',
	'saving replays',
	'ethically superior to me',
	'only using the A button',
	'only using the B button',
	'Reggie Fils-Aim\u00e9',
	"picking stages that I don't like",
	'bad and should feel bad',
	'low on batteries',
	'cold',
	'sticky',
	'blocking the screen',
	'walking in front of the screen',
	'tangling my controller cable',
	'incapable of melting steel beams',
	'too attractive',
	'too fast',
	'using an ugly alternative costume',
	'using counters too much',
	'spamming PK Fire',
	'my b',
	'really hard to remember',
	'not going to the doctor'
];

function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function generate() {
	const finalPrep = prep[getRandInt(0, prep.length - 1)];
	const finalSubject = subjects[getRandInt(0, subjects.length - 1)];
	const finalProblem = problems[getRandInt(0, problems.length - 1)];
	return `${finalPrep} ${finalSubject} ${finalProblem}.`;
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
