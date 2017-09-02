const controller = require("./rtm");
require('./hangman/hangbot');
require('./trivia/triviabot');

controller.hears('!proc_exit', 'direct_message', (bot, message) => {
    process.exit(0);
});