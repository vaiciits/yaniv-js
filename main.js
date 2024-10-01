const MAX_HAND_SIZE = 5;
const MAX_PLAYER_COUNT = 4;
const DISPLAY_NONE = 'none';
const DISPLAY_FLEX = 'flex';
const CARD_SELECTED = 'selected';

class Deck {
    cards = [];

    init() {
        const suites = Suite.all();
        const values = Value.all();

        suites.forEach(suite => {
            values.forEach(value => {
                this.cards.push(new Card(suite, value));
            });
        });

        this.cards.push(new JokerCard('red'));
        this.cards.push(new JokerCard('black'));

        return this;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this.cards;
    }

    take() {
        let card = this.cards.pop();
        // console.log(this.cards);
        // console.log(this.cards.length);
        // TODO Reshuffle if empty
        if (this.cards.length === 0) {
            throw new Error('Please reshuffle');
        }
        return card;
    }
}

// Suite enum
// const suite = Object.freeze({
//     CLUBS: 'Clubs',
//     DIAMONDS: 'Diamonds',
//     HEARTS: 'Hearts',
//     SPADES: 'Spades',
// });

class Suite {
    static CLUBS = 'Clubs';
    static DIAMONDS = 'Diamonds';
    static HEARTS = 'Hearts';
    static SPADES = 'Spades';

    constructor(value) {
        if (!this.isValidValue(value)) {
            throw new Error(`Invalid suite: ${value}`);
        }
        this.value = value;
    }

    static all() {
        return Object.values(Suite);
        // return Object.values(Suite).map(value => new Suite(value));
    }

    isValidValue(value) {
        return Object.values(Suite).includes(value);
    }
}

class Value {
    static ACE = 1;
    static TWO = 2;
    static THREE = 3;
    static FOUR = 4;
    static FIVE = 5;
    static SIX = 6;
    static SEVEN = 7;
    static EIGHT = 8;
    static NINE = 9;
    static TEN = 10;
    static JACK = 11;
    static QUEEN = 12;
    static KING = 13;

    constructor(value) {
        if (!this.isValidValue(value)) {
            throw new Error(`Invalid card value: ${value}`);
        }
        this.value = value;
    }

    static all() {
        return Object.values(Value);
    }

    isValidValue(value) {
        return Object.values(Value).includes(value);
    }

    represent() {
        if (this.value > 1 && this.value < 11) {
            return this.value;
        }

        switch (this.value) {
            case Value.ACE:
                return 'A';
            case Value.JACK:
                return 'J';
            case Value.QUEEN:
                return 'Q';
            case Value.KING:
                return 'K';
        }
    }
}

class CardInterface {
    getColor() {
        throw new Error('Method getColor() must be implemented.');
    }

    getNumeric() {
        throw new Error('Method getNumeric() must be implemented.');
    }

    getSuite() {
        throw new Error('Method getSuite() must be implemented.');
    }

    getValue() {
        throw new Error('Method getValue() must be implemented.');
    }

    represent() {
        throw new Error('Method represent() must be implemented.');
    }
}

class Card extends CardInterface {
    constructor(suite, value) {
        super();
        this.suite = new Suite(suite);
        this.value = new Value(value);
    }

    getColor() {
        switch (this.suite.value) {
            case Suite.CLUBS:
            case Suite.SPADES:
                return 'black';
            case Suite.DIAMONDS:
            case Suite.HEARTS:
                return 'red';
            default:
                throw new Error(`Can't get color for ${this.suite.value}`);
        }
    }

    getNumeric() {
        return this.value.value;
    }

    getSuite() {
        return this.suite.value;
    }

    getValue() {
        return this.value.represent();
    }

    represent() {
        return this.value.represent() + ' ' + this.suite.value;
    }
}

class JokerCard extends CardInterface {
    constructor(color) {
        super();
        this.color = color;
    }

    getColor() {
        return this.color;
    }

    getNumeric() {
        return 0;
    }

    getSuite() {
        return null;
    }

    getValue() {
        return 'Joker';
    }

    represent() {
        return this.getValue();
    }
}

class Player {
    constructor(id, name, score = 0) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.hand = [];
        this.selected = [];
    }

    addCard(card) {
        if (this.hand.length >= 5) {
            throw new Error(`Payer ${this.id} ${this.name} will have to many cards`);
        }
        this.hand.push(card);
        this.updateHand();
    }

    cardRepresentation(value) {
        // TODO back of the card
        return '';
    }

    playCards() {
        if (this.selected.length === 0) {
            // TODO proper notification
            alert('Please select cards to play.');
            return [];
        }

        if (!this.selectedIsValid()) {
            // TODO proper notification
            alert('Selected cards are not valid.');
            return [];
        }

        for (let i = 0; i < this.selected.length; i++) {
            for (let j = 0; j < this.hand.length; j++) {
                if (this.hand[j] === this.selected[i]) {
                    this.hand.splice(j, 1);
                    break;
                }
            }
        }

        const selected = this.selected;
        this.selected = [];
        return selected;
    }

    select(cardIndex) {
        if (cardIndex >= this.hand.length) {
            throw new Error(`Trying to select unavailable card: ${cardIndex} for player ${this.id}.`);
        }
        const card = this.hand[cardIndex];
        const selectedIndex = this.selected.indexOf(card);
        if (selectedIndex >= 0) {
            this.selected.splice(selectedIndex, 1);
        } else {
            this.selected.push(card);
        }
    }

    selectedInOrder() {
        const values = this.selected.map(card => card.getNumeric());
        values.sort();
        return values.every((value, index, array) =>
            index === 0 || value - 1 === array[index - 1]
        );
    }

    selectedIsValid() {
        return (this.selected.length > 0) && (
            (this.selected.length === 1)
            || this.selectedSameValue()
            || this.selectedStraight()
        );
    }

    selectedSameSuite() {
        const suite = this.selected[0].getSuite();
        // Skip the very first as comparing against it.
        for (let i = 1; i < this.selected.length; i++) {
            if (this.selected[i].getSuite() !== suite) {
                return false;
            }
        }

        return true;
    }

    selectedSameValue() {
        const value = this.selected[0].getNumeric();
        // Skip the very first as comparing against it.
        for (let i = 1; i < this.selected.length; i++) {
            if (this.selected[i].getNumeric() !== value) {
                return false;
            }
        }

        return true;
    }

    selectedStraight() {
        return this.selectedSameSuite() && this.selectedInOrder();
    }

    updateHand() {
        const hand = document.querySelectorAll(`#player-${this.id} .hand .card`);
        const handSize = this.hand.length;
        // TODO Init hand with MAX_HAND_SIZE on game init
        for (let i = 0; i < MAX_HAND_SIZE; i++) {
            hand[i].style.display = i < handSize ? DISPLAY_FLEX : DISPLAY_NONE;
            if (i < handSize) {
                hand[i].style.display = DISPLAY_FLEX;
                hand[i].innerHTML = this.cardRepresentation(this.hand[i].represent());
            } else {
                hand[i].style.display = DISPLAY_NONE;
            }
        }
    }
}

class Human extends Player {
    cardRepresentation(value) {
        return value;
    }
}

class Bot extends Player {
}

class Yaniv {
    constructor(deck, players, turn = 0) {
        this.deck = deck;
        if (players.length > MAX_PLAYER_COUNT) {
            throw new Error('Too many players.');
        }
        this.players = players;
        this.turn = turn; // Who's turn
        this.played = []; // Array of arrays
    }

    deal() {
        for (let i = 0; i < MAX_HAND_SIZE; i++) {
            this.players.forEach(player => {
                player.addCard(this.deck.take());
            });
        };
    }

    getCardDivs() {
        return document.querySelectorAll('#player-1 .hand .card');
    }

    getPlayer(index) {
        if (index >= this.players.length) {
            throw new Error(`Trying to access unavailable player: ${index}.`);
        }
        return this.players[index];
    }

    select(cardIndex) {
        this.getPlayer(0).select(cardIndex);
        this.visualiseSelect(cardIndex);
    }

    takeFromDeck(playerIndex) {
        const player = this.getPlayer(playerIndex);
        const playedCards = player.playCards();
        if (playedCards.length > 0) {
            player.addCard(this.deck.take());
            this.unselect();
        }
    }

    unselect() {
        const cardDivs = this.getCardDivs();
        cardDivs.forEach(card => {
            if (card.classList.contains(CARD_SELECTED)) {
                card.classList.remove(CARD_SELECTED);
            }
        });
    }

    visualiseSelect(cardIndex) {
        const cardDivs = this.getCardDivs();
        const cardDiv = cardDivs[cardIndex];
        if (cardDiv.classList.contains(CARD_SELECTED)) {
            cardDiv.classList.remove(CARD_SELECTED);
        } else {
            cardDiv.classList.add(CARD_SELECTED);
        }
    }
}

const players = [
    new Human(1, 'Player 1'),
    new Bot(2, 'Bot 1'),
    new Bot(3, 'Bot 2')
];
const deck = (new Deck()).init();
deck.shuffle();
const game = new Yaniv(deck, players);

document.addEventListener('DOMContentLoaded', () => {
    // game.deck.shuffle();
    // game.deck.cards.forEach(card => console.log(card.represent()));
    // game.players.forEach(player => console.log(player.name));
    // game.players.forEach(player => console.log(player.score));

    game.deal();
});
