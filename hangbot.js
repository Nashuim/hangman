const Botkit = require('botkit');
const Hangman = require("./hangman");
const request = require("request");
const {RtmClient, MemoryDataStore, CLIENT_EVENTS} = require('@slack/client');
const token = process.env.TOKEN;
const channelName = process.env.CHANNEL || "games";


const base_request_options = {
    baseUrl : "http://www.giantbomb.com/api",
    qs: {
        api_key: process.env.GAME_API_KEY,
        format: "json",
        field_list : "name"
    },
    headers: {
        "User-Agent" : "Hangman game for my slack team using game names"
    }
};

const api = request.defaults(base_request_options);

let channel_id, gameCount;



api("/games", (err, res, body) => {
    if(err || res.statusCode !== 200) {
        console.log("Error on count...");
        process.exit(-2);
    } else {
        gameCount = JSON.parse(body).number_of_total_results;
    }
});

const controller = Botkit.slackbot();

let users = [];

const rtm = new RtmClient(token, {
    logLevel: 'error',
    dataStore: new MemoryDataStore(),
    autoReconnect: true,
    autoMark: true
});
rtm.start();

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    users = rtm.dataStore.users;

    for (let key of Object.keys(rtm.dataStore.channels)) {
        let channel = rtm.dataStore.channels[key];
        if (channel.name === channelName) {
            channel_id = channel.id;
            break;
        }
    }
    if (!channel_id) {
        console.error(`Channel with name "${channelName}" required`);
        process.exit(-1);
    }
    rtm.disconnect();
});

rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, function () {
    const hangBot = controller.spawn({
        token: token
    }).startRTM();

    hangBot.replyToUser = function (src, rsp) {
        src.channel = channel_id;
        let msg = `${users[src.user].name}: ${rsp}`;

        this.reply(src, msg);
    };
});

const messageTypes = ['ambient'];
const hangman = new Hangman();

controller.hears('^!hangman ([\\w À-ÿ:\\-\'\.]+)(?: \\| )?(normal|hard)?$', 'direct_message',  (bot, message) => {
    if (hangman.running) {
        bot.reply(message, 'A game is already underway, use !quit in the channel to stop.');
    } else {
        let result = hangman.start(message.match[1], message.match[2]);
        if(!result)
            bot.reply(message, "I can't start a game with that!");
        else
            bot.replyToUser(message, result);
    }
});

controller.hears('!quit', messageTypes, (bot, message) => {
    if (!hangman.running) {
        bot.replyToUser(message, 'No game is currently underway, you can start one using !hangman {word}');
    } else {
        bot.replyToUser(message, hangman.stop());
    }
});

controller.hears(['!g (.*)', '!guess (.*)'], messageTypes, (bot, message) => {
    if (!hangman.running) {
        bot.replyToUser(message, 'No game is currently underway, you can start one using !hangman {word}');
    } else {
        bot.replyToUser(message, hangman.guess(message.match[1]));
    }
});

controller.hears('!gamehangman(?: (normal|hard))?', messageTypes, (bot, message) => {
    if (hangman.running) {
        bot.replyToUser(message, 'A game is already underway, use !quit in the channel to stop.');
    } else {
        let gameId = Math.floor(Math.random() * gameCount) + 1;
        api(`/game/3030-${gameId}`, (err, res, body) => {
            let name = JSON.parse(body).results.name;
            if (err || res.statusCode !== 200 || !name) {
                bot.replyToUser(message, "Woops! You somehow managed to hit a game that doesn't exist! Nice luck. Try again?")
            } else {
                bot.replyToUser(message, hangman.start(name, message.match[1]));
            }
        });
    }
});

controller.hears('!proc_exit', 'direct_message', (bot, message) => {
    process.exit(0);
});