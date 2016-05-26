const Botkit = require('botkit');
const Hangman = require("./hangman");
const {RtmClient, MemoryDataStore, CLIENT_EVENTS} = require('@slack/client');
const token = process.env.TOKEN;
const channel = process.env.CHANNEL || "games";
let channel_id;

const controller = Botkit.slackbot();

let users = [];
var rtm = new RtmClient(token, {
    logLevel: 'error',
    dataStore: new MemoryDataStore(),
    autoReconnect: true,
    autoMark: true
});

rtm.start();

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
    users = rtm.dataStore.users;

    for (let key of Object.keys(rtm.dataStore.groups)) {
        let channel = rtm.dataStore.groups[key];
        if (channel.name === channel) {
            channel_id = channel.id;
            break;
        }
    }
    if (!channel_id) {
        console.error(`Channel with name "${channel}" required`);
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

controller.hears('!proc_exit', 'direct_message', (bot, message) => {
    process.exit(0);
});