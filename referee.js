// Requiring our module
var slackAPI = require('slackbotapi');

// Starting
var slack = new slackAPI({
	'token': process.env.SLACK_BOT_REF,
	'logging': true
});
// BattleBots C02T3BUV1
const battlebotsChannel = "C02T3BUV1"

var users = {};

function countUsersActivelyScoring() {
	var i = 0;
	for (var key in users) {
		if (users[key].scoring === true) ++i;
	}
	return i;
}

function getScore(userid) {
	var score = 0;
	var scores = users[userid].scores;
	console.log(scores)
	for (var i = 0; i < scores.length; ++i)
		if (scores[i].end !== undefined)
			score += scores[i].end - scores[i].start
	return score;
}

function username(userid) {
	if (!users[userid].name) 
		users[userid].name = slack.getUser(userid).name
	return users[userid].name;
}

function reportScores(data) {
	var scoreBoard = [];
	for (var key in users) {
		scoreBoard.push({ 
			user: username(users[key].userid),
			score : getScore(users[key].userid) 
		});
	}
	scoreBoard.sort(function(a,b){return a.score > b.score});
	var msg = "Scores:\n";
	for (var i in scoreBoard)
		msg += "\t" + scoreBoard[i].user + ": " + scoreBoard[i].score + "\n";
	slack.sendMsg(battlebotsChannel, msg);
	slack.reqAPI("chat.postMessage", {text: msg})
}

function applyMoop(data) {
	if (!users[data.user]) users[data.user] = { scores: [], userid: data.user };
	var now = Date.now()
	for (var key in users) {
		if (users[key].scoring === true) {
			users[key].scores[ users[key].scores.length - 1 ].end = Date.now();
			users[key].scoring = false;
		}
	}
}

function applyMeep(data) {
	if (countUsersActivelyScoring() >= Math.floor(Object.keys(users)*0.25)) return slack.sendMsg(battlebotsChannel, "Invalid Meep; >25% of players trying to meep");
	if (users[data.user].scoring === true) return;
	users[data.user].scoring = true;
	users[data.user].scores.push({start: Date.now()});
}

slack.on('message', function(data) {
	if (data.channel === battlebotsChannel) {
		if (!users[data.user]) users[data.user] = { scores: [] };
		if (data.text === "Scores") return reportScores(data);
		if (data.text === "Meep") return applyMeep(data);
		if (data.text === "Moop") return applyMoop(data);
	}
});

slack.on('hello', function(data) {
	slack.sendMsg(battlebotsChannel, "Referee initialized - all scores zeroed")
	setInterval(function() {
		slack.sendMsg(battlebotsChannel, "Clearing Scores, resetting, here are the results:")
		reportScores()
		users = {};
	}, 1000*60*1)
})