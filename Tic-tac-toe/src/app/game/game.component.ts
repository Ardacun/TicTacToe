import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Game } from '../game';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  providers: [Game]
})
export class GameComponent implements OnInit{
  
  existingRooms: { roomId: string, players: Array<string> }[] = [];
  isButtonDisabled: boolean = true;

  constructor(public game : Game,
    private websocketService: WebSocketService)
  {
   
  }

  ngOnInit(): void {
    // Request the list of existing rooms with player counts from the server
    this.websocketService.getRooms().subscribe((rooms: { roomId: string, players: Array<string> }[]) => {
      this.existingRooms = rooms;
    });
  }

  onInput(value: string): void {
    this.isButtonDisabled = value.trim() === '';
  }

  joinGame(name: string): void {
    if(this.existingRooms.length == 0)
    {
      this.websocketService.joinRoom(name, "");
      this.websocketService.onStartGame(() => {
        this.startGame(true);
      });
    }
    else
    {
      let room = "";
      for(const element of this.existingRooms)
      {
        if(element.players.length < 2 || element.players.length == undefined)
        {
          room = element.roomId;
          break;
        } 
      }
      this.websocketService.joinRoom(name, room);
      this.websocketService.onStartGame(() => {
      this.startGame(true);
      });
    }
    
    
      
  }

  startGame(online : boolean): void {
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
    
    await this.game.checkGameEndWinner().then( (end: boolean) => {
      if(this.game.gameStatus === 0 && end)
      {
        console.log(playerinformation);
        if(playerinformation) 
        { 
          playerinformation.innerHTML = "Winner is player " + this.game.currentTurn + ".";
        }
      }
    });
    await this.game.checkGameEndFull().then( (end: boolean) => {
      if(this.game.gameStatus === 0 && end)
      {
        if(playerinformation) 
        { 
          playerinformation.innerHTML = "No winner, draw.";
        }
      }
    });

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
