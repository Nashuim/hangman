const request = require("request");

const base_request_options = {
    qs: {
        amount: 1
    },
    headers: {
        "User-Agent": "Trivia game for my slack team"
    }
};

const api = request.defaults(base_request_options);

function getTriviaQuestion(){
    return new Promise(resolve =>{
    api('https://opentdb.com/api.php', (err, res, body) => {
            const result = JSON.parse(body);
            resolve(result.results[0]);
        })
    });
}

module.exports = {
    getTriviaQuestion
}