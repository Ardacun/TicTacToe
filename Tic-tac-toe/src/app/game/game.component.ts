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
  
  // Existing rooms on server
  existingRooms: { roomId: string, players: Array<string> }[] = [];
  
  // Disable button of online mode if needed
  isButtonDisabled: boolean = true;

  // Current room id
  roomId: string = '';

  constructor(public game : Game,
    private websocketService: WebSocketService)
  {
   
  }

  ngOnInit(): void {
    // Request the list of existing rooms with player counts from the server
    this.websocketService.getRooms().subscribe((rooms: { roomId: string, players: Array<string> }[]) => {
      this.existingRooms = rooms;
    });

    // Handle move made by other player
    this.websocketService.onMoveMade((position, currentTurn) => {
      console.log('Move made by other player:', position);
      console.log('Player turn:', currentTurn);
      this.MoveMade(position, currentTurn);
    });

  }

  // Enable online mode button on input
  onInput(value: string): void {
    this.isButtonDisabled = value.trim() === '';
  }

  // Handle joining rooms for online mode
  joinGame(name: string): void {
    if(this.existingRooms.length == 0)
    {
      this.websocketService.joinRoom(name, "");
      this.websocketService.onStartGame((roomId, firstPlayer) => {
        this.startGame(roomId, firstPlayer);
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
      this.websocketService.onStartGame((roomId, firstPlayer) => {
      this.startGame(roomId, firstPlayer);
      });
    }
  }

  // Start game based on room id (if online)
  startGame(roomId?: string, firstPlayer?: string): void {
    if(roomId == undefined)
    {    
    this.game.isGameOnline(false);
    this.game.gameStart();
    }
    else
    {
      this.roomId = roomId;
      this.game.isGameOnline(true);
      this.game.gameStart(firstPlayer);
    }
    
    // Update existing rooms by requesting server
    this.websocketService.getRooms().subscribe((rooms: { roomId: string, players: Array<string> }[]) => {
      this.existingRooms = rooms;
      let currentPlayer = "";
      if(!roomId) {
        currentPlayer = 'Current turn: Player ' + this.game.currentTurn + '.';
      } else {
        let name = "";
        let playerIndex = (this.game.currentTurn === 1) ? 0 : 1;
        for (const element of this.existingRooms) {
          if (element.roomId === roomId) {
              name = element.players[playerIndex];
              break;
          }
        }
        currentPlayer = 'Current turn: Player ' + name + '.';
      }
      
      const playerinformation = document.querySelector('.player-information');
      if(playerinformation){
        playerinformation.innerHTML = currentPlayer;
      }
    });
    
  }

  // Handle clicks on subfields
  async clickSubfield(subfield: any, roomId: string) : Promise<void> {
    if(this.game.gameStatus === 1)
    {
    const position = subfield.currentTarget.getAttribute('position');
    const playerinformation = document.querySelector('.player-information');
    
    if(this.game.gameOnline == true) this.websocketService.makeMove(position, this.game.currentTurn, roomId);
    
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

  // Handle moves made in online mode by player
  async MoveMade(position: any, currentPlayer: any) : Promise<void> {
    
    const playerinformation = document.querySelector('.player-information');
    const subfield = document.querySelector('.subfield[position="' + position + '"]');
    const color = this.game.getPlayerColorClass();

    this.game.setField(position, currentPlayer);
    if(subfield != null)subfield.classList.add(color);

    await this.game.checkGameEndWinner().then( (end: boolean) => {
      if(this.game.gameStatus === 0 && end)
      {
        console.log(playerinformation);
        if(playerinformation) 
        { 
          playerinformation.innerHTML = "Winner is player " + currentPlayer + ".";
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
      const current = 'Current turn: Player ' + currentPlayer + '.';
      if(playerinformation){
        playerinformation.innerHTML = current;
      }
    }
  }
}


