const regex = new RegExp("[A-Za-z]");
const stripRegex = /[^A-Za-z]/g;
const letterRegex = /\s/i;
const Difficulty = {
    Normal : "normal",
    Hard : "hard"
};

class Hangman {
    constructor() {
        this.maxGuesses = 6;
        this.running = false;
    }

    guess(guessed) {
        if (!regex.test(guessed)) {
            return "Note that you don't need to guess special characters or numbers";
        }

        stripRegex.lastIndex = 0;
        guessed = guessed.toUpperCase().replace(stripRegex, "");
        if (!this.guesses[guessed]) {
            let correct, end;

            if(guessed.length === 1) {
                let ocurrences = (this.strippedWord.match(new RegExp(guessed, 'g')) || []).length;
                this.total += ocurrences;
                correct = ocurrences > 0;
                end = this.total === this.strippedWord.length;
            } else {
                end = correct = guessed === this.strippedWord;
            }

            let guess = this.guesses[guessed] = {
                letter: guessed,
                correct: correct
            };

            if (!guess.correct)
                this.nGuesses++;

            if (end) {
                this.running = false;
                return `Congratulations! The word was "*${this.word}*".`;
            } else {

                let extra = "";
                if (this.nGuesses >= this.maxGuesses) {
                    if(this.difficulty === Difficulty.Normal){
                        this.running = false;
                        return `The chat has failed! The word was *${this.word}*.`;
                    }

                    extra = "- The chat has failed! It's possible to quit using !quit.";
                }

                let result = guess.correct ? "*Correct!*" : "_Incorrect_";
                return `${result} [${this.representation}] [${this.nGuesses}/${this.maxGuesses}] ${this.allGuesses} ${extra}`;
            }

        } else {
            return "This was already guessed.";
        }
    }

    get representation() {
        let ret = "";
        for (let i = 0; i < this.wordUpper.length; ++i) {
            let letter = this.word[i];
            let guess = this.guesses[this.wordUpper[i]];
            if (!regex.test(letter) || guess && guess.correct) {
                if(this.difficulty !== Difficulty.Hard || !letterRegex.test(letter))
                    ret += letter;
            } else {
                if(this.difficulty === Difficulty.Normal)
                    ret += "_";
            }
        }

        return `\`${ret}\``;
    }

    get allGuesses() {
        let words = [];
        for (let key of Object.keys(this.guesses)) {
            let g = this.guesses[key];
            if (g.correct)
                words.push(`*${g.letter}*`);
            else
                words.push(`_${g.letter}_`);
        }

        return words.join(", ");
    }

    start(word, difficulty) {
        this.word = word;
        this.wordUpper = word.toUpperCase();
        this.guesses = {};
        this.nGuesses = 0;
        this.total = 0;
        this.strippedWord = this.wordUpper.replace(stripRegex, "");
        if(this.strippedWord.length === 0)
            return false;
        this.difficulty = difficulty || Difficulty.Normal;
        this.running = true;

        return `A new Hangman game has started! [${this.representation}] [${this.nGuesses}/${this.maxGuesses}}.`;
    }

    stop() {
        this.running = false;
        return `Game stopped, the word was *${this.word}*.`;
    }
}

module.exports = Hangman;
