//Map to store game rooms
const rooms = new Map();

module.exports = (io) => {

    io.on('connection', socket => {

        console.log('new connection'); 
        
        // Event handler for when a player joins a room
        socket.on('join', (roomId) => {
        // Create a new room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { players: [] });
        }
        
        // Add the player to the room
        const room = rooms.get(roomId);
        room.players.push(socket.id);
        socket.join(roomId);

        // Start the game when two players join the room
        if (room.players.length === 2) {
            io.to(roomId).emit('startGame');
        }

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
	

	})
}