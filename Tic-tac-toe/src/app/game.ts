import { Gamestatus } from './gamestatus';

export class Game {
    gameField: Array<number> = [];

    currentTurn: any;

    gameStatus: Gamestatus;

    gameOnline : boolean;

    winSituationsPlayerOne: Array<Array<number>> = [
        [1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1],
        [0, 0, 1, 0, 1, 0, 1, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
    ];

    winSituationsPlayerTwo: Array<Array<number>> = [
        [2, 2, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 2, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 2],
        [2, 0, 0, 2, 0, 0, 2, 0, 0],
        [0, 2, 0, 0, 2, 0, 0, 2, 0],
        [0, 0, 2, 0, 0, 2, 0, 0, 2],
        [0, 0, 2, 0, 2, 0, 2, 0, 0],
        [2, 0, 0, 0, 2, 0, 0, 0, 2],
    ];

    public constructor() {
        this.gameStatus = Gamestatus.STOP;
        this.gameField = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.currentTurn = 0;
        this.gameOnline = false;
    }

    isGameOnline(online: boolean): void {
        if(online)
        {
            this.gameOnline = true;
        }
        else
        {
            this.gameOnline = false;
        }
    }
    gameStart(firstPlayer?: string): void {
        this.gameStatus = Gamestatus.START;
        if(!this.gameOnline)
        {
            this.currentTurn = this.randomPlayerStart();
        }
        else 
        {
            this.currentTurn = firstPlayer; 
        }
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
        if(isFull)
        {
            this.gameEnd();
            return true;
        }
        else
        {
            return false;
        }
    }
    gameEnd() : void {
        this.gameStatus = Gamestatus.STOP;
    }

    arrayEquals(a: Array<any>, b: Array<any>): boolean {
        return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]); 
    }

    async checkGameEndWinner(): Promise<boolean> {
        let isWinner = false;

        const checkarray = (this.currentTurn === 1) ? this.winSituationsPlayerOne : this.winSituationsPlayerTwo;
        
        const currentarray:any[] = [];

        this.gameField.forEach((subfield, index) => {
            if ( subfield !== this.currentTurn ) {
                currentarray[index] = 0;
            } else {
                currentarray[index] = subfield;
            }
        });
        checkarray.forEach((checkfield, checkindex) => {
            if ( this.arrayEquals(checkfield, currentarray)  ) {
                isWinner = true;
            } 
        });

        console.log(currentarray);

        if(isWinner)
        {
            this.gameEnd();
            console.log("winner");
            return true;
        }
        else
        {
            return false;
        }
    }
}
