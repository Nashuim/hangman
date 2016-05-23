const regex = new RegExp("[A-z]");
const stripRegex = /\s/g;
const letterRegex = /\s/i;

class Hangman {
    constructor() {
        this.maxGuesses = 6;
        this.running = false;
    }

    guess(letter) {
        if (!regex.test(letter)) {
            return "Note that you don't need to guess special characters or numbers";
        }

        letter = letter.toUpperCase();
//TODO change how correct word check is done.
        if (!this.guesses[letter]) {
            if (letter.length > 1) {
                stripRegex.lastIndex = 0;
                let stripped = letter.toUpperCase().replace(stripRegex, "");
                if (stripped === this.strippedWord) {
                    this.running = false;
                    return `Congratulations! The word was "${this.word}".`;
                }
            }

            let guess = this.guesses[letter] = {
                letter: letter,
                correct: this.wordUpper.indexOf(letter) !== -1
            };

            if (!guess.correct)
                this.nGuesses++;

            let representation = this.representation;
            if (representation.length === this.strippedWord.length) {
                this.running = false;
                return `Congratulations! The word was "${this.word}".`;
            } else {
                let result = guess.correct ? "Correct" : "Incorrect";
                let extra = "";
                if (this.nGuesses >= this.maxGuesses)
                    extra = "- The chat failed! It's possible to quit using !quit";

                return `${result}! [${representation}] - ${this.nGuesses}/${this.maxGuesses} - ${this.allGuesses} ${extra}`;
            }

        } else {
            return "This letter was already guessed.";
        }
    }

    get representation() {
        let ret = "";
        for (let i = 0; i < this.wordUpper.length; ++i) {
            let letter = this.word[i];
            let guess = this.guesses[this.wordUpper[i]];
            if (!regex.test(letter) && !letterRegex.test(letter) || guess && guess.correct)
                ret += letter;
        }

        return ret;
    }

    get allGuesses() {
        let right = [];
        let wrong = [];
        for (let key of Object.keys(this.guesses)) {
            let g = this.guesses[key];
            if (g.correct)
                right.push(g.letter);
            else
                wrong.push(g.letter);
        }

        return `Right: ${right.join()} Wrong: ${wrong.join()}`;
    }

    start(word) {
        this.word = word;
        this.wordUpper = word.toUpperCase();
        this.guesses = {};
        this.nGuesses = 0;
        this.strippedWord = this.wordUpper.replace(stripRegex, "");
        this.running = true;

        return `A new Hangman game has started! [${this.representation}] ${this.nGuesses}/${this.maxGuesses}.`;
    }

    stop() {
        this.running = false;
        return `Game stopped, the word was "${this.word}".`;
    }
}

module.exports = Hangman;