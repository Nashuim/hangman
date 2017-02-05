const request = require("request");

const base_request_options = {
    baseUrl: "http://www.giantbomb.com/api",
    qs: {
        api_key: process.env.GAME_API_KEY,
        format: "json",
        field_list: "name,deck,image,site_detail_url,developers,publishers,genres,platforms,original_release_date,expected_release_year,expected_release_quarter,expected_release_month,expected_release_day"
    },
    headers: {
        "User-Agent": "Hangman game for my slack team using game names"
    }
};

const api = request.defaults(base_request_options);

let gameCount;

function updateCount() {
    return new Promise(resolve => {
        api("/games", (err, res, body) => {
            if (err || res.statusCode !== 200) {
                console.log("Error on count...");
                process.exit(-2);
            } else {
                gameCount = JSON.parse(body).number_of_total_results;
                resolve(gameCount);
            }
        });
    })
}

function getGame() {
    return new Promise((resolve, reject) => {
        let gameId = Math.floor(Math.random() * gameCount) + 1;
        api(`/game/3030-${gameId}`, (err, res, body) => {
            let error = err || res.statusCode !== 200;

            let game = null;
            if(!error){
                game = JSON.parse(body).results;
            }

            if (error || !game || !game.name) {
                reject(Error("Woops! You somehow managed to hit a game that doesn't exist! Nice luck. Try again?"));
            } else {
                resolve(game);
            }
        });
    });
}


module.exports = {
    updateCount,
    getGame
}