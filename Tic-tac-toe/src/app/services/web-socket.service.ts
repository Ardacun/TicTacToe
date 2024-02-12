import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  private webSocket: Socket;

  constructor() {
   this.webSocket = new Socket({
    url: 'http://localhost:3000',
    options: {},
   });
  }

 // this method is used to start connection/handhshake of socket with server
 connectSocket(message: any) {
  this.webSocket.emit('message', message);
 }

 // this method is used to get response from server
 receiveStatus() {
  return this.webSocket.fromEvent('/get-response');
 }

 // this method is used to end web socket connection
 disconnectSocket() {
  this.webSocket.disconnect();
 }

 // Method to join a room
 joinRoom(playerName: string, roomId: string): void {
   this.webSocket.emit('join', {playerName, roomId});
 }

 // Method to make a move in a room
 makeMove(roomId: string, move: any) {
   this.webSocket.emit('makeMove', roomId, move);
 }

 // Event handler for when a game starts in a room
 onStartGame(callback: (roomId: any, firstPlayer: string) => void) {
   this.webSocket.on('startGame', callback);
 }

 // Event handler for when a move is made in a room
 onMoveMade(callback: (move: any) => void) {
   this.webSocket.on('moveMade', callback);
 }

 // Event handler to request a list of existing rooms
 getRooms(): Observable<{ roomId: string, players: Array<string> }[]> {
  // Emit a request to the server to get the list of existing rooms with player counts
  this.webSocket.emit('getRooms');

  // Return an observable to listen for the response
  return new Observable((observer) => {
    this.webSocket.on('existingRooms', (rooms: { roomId: string, players: Array<string> }[]) => {
      observer.next(rooms);
    });
  });
 }

}

