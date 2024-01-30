import { Gamestatus } from './gamestatus';

export class Game {
    gameField: Array<number> = [];

    currentTurn: number;

    gameStatus: Gamestatus;

    public constructor() {
        this.gameStatus = Gamestatus.STOP;
        this.gameField = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.currentTurn = 0;
    }
    gameStart(): void {
        this.gameStatus = Gamestatus.START;
        this.currentTurn = this.randomPlayerStart();
        console.log(this.currentTurn);
        this.gameField = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    randomPlayerStart(): number {
        const startPlayer = Math.floor(Math.random() * 2) + 1;
        return startPlayer;
    }

    setField(position: number , value: number) : void {
        this.gameField[position] = value;
    }
    
    getPlayerColorClass(): string {
        const colorClass = (this.currentTurn === 2) ? 'player-two' : 'player-one';
        return colorClass;
    }
    changePlayer(): void {
        this.currentTurn = (this.currentTurn === 2) ? 1 : 2;
    }
    async checkGameEndFull() : Promise<boolean> {
        let isFull = true;
        if(this.gameField.includes(0))
        {
            isFull = false;
        }
        return isFull;    
    }

    async checkGameEndWinner(): Promise<boolean> {
        //TO-DO
        let isWinner = true;
        return isWinner;
    }
}
