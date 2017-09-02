//TODO Update botkit
//TODO ngrok locally
//TODO Setup a server
//TODO Buy a domain

const api = require("./api");
const controller = require("../rtm");

const messageTypes = ['ambient'];

controller.hears('!trivia', messageTypes, (bot, message) => {
    api.getTriviaQuestion().then(res => {
        const id = toBase64(res.question);
        bot.replyToUser(message, res.question, [
            {
               fallback: res.question,
               color: "#4d5051",
               callback_id: id,
               footer: "Triviabot",
               footer_icon: "http://www.learntarot.com/bigjpgs/maj09.jpg",
               actions: actions(res)
            }
        ]);
    });
});


function actions(question){
    const correct = button(question.correct_answer, "true");

    const actions = question.incorrect_answers.map(q => button(q, "false"));

    actions.push(correct);

    return actions;
}

function button(text, value){
    return {
        name: "answer",
        text: text,
        "type": "button",
        value: value
    }
}

function toBase64(value){
  return Buffer.from(value).toString('base64');
}