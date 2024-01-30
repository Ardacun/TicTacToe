import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Game } from '../game';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  providers: [Game]
})
export class GameComponent {
  constructor(public game : Game)
  {

  }

  //ngOnInit(): void { }

  startGame(): void {
    this.game.gameStart();
    const currentPlayer = 'Current turn: Player ' + this.game.currentTurn + '.';
    const playerinformation = document.querySelector('.player-information');
    if(playerinformation){
      playerinformation.innerHTML = currentPlayer;
    }
  }

  async clickSubfield(subfield: any) : Promise<void> {
    if(this.game.gameStatus === 1)
    {
    const position = subfield.currentTarget.getAttribute('position');
    const playerinformation = document.querySelector('.player-information');
    
    this.game.setField(position, this.game.currentTurn);
    const color = this.game.getPlayerColorClass();
    subfield.currentTarget.classList.add(color);
    
    await this.game.checkGameEndWinner();

    await this.game.checkGameEndFull();

    this.game.changePlayer();

    if(this.game.gameStatus === 1)
    {
      const currentPlayer = 'Current turn: Player ' + this.game.currentTurn + '.';
      if(playerinformation){
        playerinformation.innerHTML = currentPlayer;
      }
    }
    }


    
  }
}
