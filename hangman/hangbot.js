const Hangman = require("./hangman");
const api = require("./api");
const controller = require("../rtm");

api.updateCount();

let currentGame = null;
const messageTypes = ['ambient'];
const hangman = new Hangman();

controller.hears('^!hangman ([\\w À-ÿ:\\-\'\.]+)(?: \\| )?(normal|hard)?$', 'direct_message', (bot, message) => {
    if (hangman.running) {
        bot.reply(message, 'A game is already underway, use !quit in the channel to stop.');
    } else {
        let result = hangman.start(message.match[1], message.match[2]);
        if (!result)
            bot.reply(message, "I can't start a game with that!");
        else
            bot.replyToUser(message, result);
    }
});

controller.hears('!quit', messageTypes, (bot, message) => {
    if (!hangman.running) {
        bot.replyToUser(message, 'No game is currently underway, you can start one using !hangman {word}');
    } else {
        finishHangman(bot, message, hangman.stop());
    }
});

controller.hears(['!g (.*)', '!guess (.*)'], messageTypes, (bot, message) => {
    if (!hangman.running) {
        bot.replyToUser(message, 'No game is currently underway, you can start one using !hangman {word}');
    } else {
        const result = hangman.guess(message.match[1]);
        if (!hangman.running) {
            finishHangman(bot, message, result);
        } else {
            bot.replyToUser(message, result);
        }
    }
});

controller.hears('!gamehangman(?: (normal|hard))?', messageTypes, (bot, message) => {
    if (hangman.running) {
        bot.replyToUser(message, 'A game is already underway, use !quit in the channel to stop.');
    } else {
        api.getGame().then(game => {
            currentGame = game;
            bot.replyToUser(message, hangman.start(game.name, message.match[1]));
        }).catch(err => {
            bot.replyToUser(message, err.message);
        })
    }
});

controller.hears('!update_count', 'direct_message', (bot, message) => {
    api.updateCount().then(count => bot.reply(message, `Game count updated to ${count}`));
});

function finishHangman(bot, message, text) {
    let attachments = null;
    if (currentGame) {
        attachments = [
            {
               fallback: currentGame.name,
               color: "#4d5051",
               title: currentGame.name,
               title_link: currentGame.site_detail_url,
               text: currentGame.deck,
               footer: "Hangbot",
               footer_icon: "http://www.learntarot.com/bigjpgs/maj12.jpg",
               fields: [
                   field("Platforms", currentGame.platforms),
                   field("Genres", currentGame.genres),
                   field("Developers", currentGame.developers),
                   field("Publishers", currentGame.publishers),
                   releaseDateField(currentGame)
                ]
            }
        ];

        if(currentGame.image){
             attachments[0].image_url = currentGame.image.super_url;
             attachments[0].thumb_url =  currentGame.image.thumb_url;
        }

        currentGame = null;
    }

    bot.replyToUser(message, text, attachments);
}

function field(title, values){
    if(values){
        return {
            title: title,
            value: values.map(v => v.abbreviation || v.name).join(", "),
            short: true
        }
    }
}

function releaseDateField(game){
    let date = null;
    if(game.original_release_date)
        date = game.original_release_date.slice(0, 10);
    else if(game.expected_release_day || game.expected_release_month || game.expected_release_quarter || game.expected_release_year){
        date = "";

        if(game.expected_release_year){
            date = game.expected_release_year;
        }

        if(game.expected_release_month){
            date = `Q${game.expected_release_quarter} ` + date;
        }

        if(game.expected_release_month){
            date = `${game.expected_release_month} ` + date;
        }

        if(game.expected_release_day){
            date = `${game.expected_release_day} ` + date;
        }

        if(date){
            date = "Expected in " + date;
        }
    }

    if(date){
        return {
            title: "Release Date",
            value : date,
            short: true
        }
    }
}