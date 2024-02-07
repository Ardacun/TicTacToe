//Map to store game rooms
const rooms = new Map();

// Function to generate a room id.
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8);
}
  
// Function to get the list of existing rooms with player counts
function getExistingRooms() {
    return Array.from(rooms).map(([roomId, players]) => ({
      roomId,
      players: players.players
    }));
}

module.exports = (io) => {

    io.on('connection', socket => {

        // Confirm new connection
        console.log('new connection'); 
        
        // Handle client requests for existing rooms
        socket.on('getRooms', () => {
            // Send the list of existing rooms with player counts to the client
            const existingRooms = getExistingRooms();
            socket.emit('existingRooms', existingRooms);
        });

        // Event handler for when a player joins a room
        socket.on('join', (informations) => {
            let roomId = informations.roomId;

            // Create a new room if roomId is empty or undefined
            if (!roomId) {
                roomId = generateRoomId();
                console.log('New room created:', roomId);
                rooms.set(roomId, { players: [] });
            }

            // Add the player to the room
            const room = rooms.get(roomId);
            
            if (room) {
                room.players.push(informations.playerName);
                console.log('Player ' + informations.playerName + ' joined room:', roomId);

                // Join the player to the room
                socket.join(roomId);

                // Start the game when two players join the room
                if (room.players.length === 2) {
                    io.to(roomId).emit('startGame');
                    console.log('Starting game in room:', roomId);
                }
            } else {
                console.log('Error: Room not found');
            }
        });


        // Event handler for when a player makes a move
        socket.on('makeMove', (roomId, move) => {
            io.to(roomId).emit('moveMade', move);
        });

        // Event handler for when a player disconnects	
        socket.on('disconnect', () => {
            console.log('A user disconnected');
            // Remove the player from all rooms they were in
            rooms.forEach((room, roomId) => {
                const index = room.players.indexOf(socket.id);
                if (index !== -1) {
                    room.players.splice(index, 1);
                    // If there are no more players in the room, delete the room
                    if (room.players.length === 0) {
                        rooms.delete(roomId);
                    }
                }
            });
        });
    });
	
}
