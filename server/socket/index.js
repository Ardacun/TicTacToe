//Map to store game rooms
const rooms = new Map();

// Map to store the randomly selected players for each room
const roomRandomPlayers = new Map();

// Function to pick a random player from a room
function pickRandomPlayer(roomId) {
    // Check if a random player has already been picked for this room
    if (roomRandomPlayers.has(roomId)) {
        // Return the previously picked random player for this room
        return roomRandomPlayers.get(roomId);
    }

    // Get the room object based on the roomId
    const room = rooms.get(roomId);

    // Check if the room exists and has players
    if (room && room.players.length > 0) {
        // Generate a random index within the range of the players array
        const randomIndex = Math.floor(Math.random() * room.players.length);
        
        // Get the random player at the random index
        const randomPlayer = room.players[randomIndex];

        // Store the randomly selected player for this room
        roomRandomPlayers.set(roomId, randomPlayer);

        // Return the randomly selected player
        return randomPlayer;
    } else {
        // Return undefined if the room doesn't exist or has no players
        return undefined;
    }
}

// Function to generate a room id.
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8);
}
  
// Function to get the list of existing rooms with player counts
function getExistingRooms() {
    // Return an array with the existing rooms
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
                    
                    //Pick a ramdom player to go first
                    const randomPlayer = pickRandomPlayer(roomId);

                    io.to(roomId).emit('startGame', roomId, randomPlayer);
                    console.log('Starting game in room:', roomId);
                }
            } else {
                console.log('Error: Room not found');
            }
        });
        
        // Event handler for when a player makes a move
        socket.on('makeMove', (position, currentPlayer, roomId) => {
            io.to(roomId).emit('moveMade', position, currentPlayer);
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
