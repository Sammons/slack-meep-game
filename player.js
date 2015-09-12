// Requiring our module
var slackAPI = require('slackbotapi');

// Starting
var slack = new slackAPI({
	'token': process.env.SLACK_BOT_PLAYER,
	'logging': true
});
// BattleBots C02T3BUV1
const battlebotsChannel = "C02T3BUV1"

var limited = false;
function sendMessageRandomly() {
	var i = Math.random();
	if (i > 2/3) return slack.sendMsg(battlebotsChannel, "Meep");
	if (i > 1/9) return slack.sendMsg(battlebotsChannel, "Moop");
}

slack.on('error', function(data) {
	if (data !== null && data !== undefined && data["error"] !== undefined) {
		console.log("SLOWING DOWN")
		limited = true;
		setTimeout(function() {
			limited = false;
		}, 2000)
	}
})

slack.on('hello', function(data) {
	setInterval(function() {
		if (!limited)
			sendMessageRandomly();
	},2000);
})