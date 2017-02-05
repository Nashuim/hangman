const Botkit = require('botkit');
const {RtmClient, MemoryDataStore, CLIENT_EVENTS} = require('@slack/client');
const token = process.env.TOKEN;
const channelName = process.env.CHANNEL || "games";

let channel_id;

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

    hangBot.replyToUser = function (src, rsp, attachments = null) {
        src.channel = channel_id;
        let msg = `${users[src.user].name}: ${rsp}`;

        if (attachments) {
            this.reply(src, { text: msg, attachments: attachments });
        } else {
            this.reply(src, msg);
        }
    };
});

module.exports = controller;