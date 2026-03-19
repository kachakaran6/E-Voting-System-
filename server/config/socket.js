function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("join", ({ role }) => {
      if (role === "ADMIN" || role === "SUPER_ADMIN") socket.join("admins");
    });
  });
}

function emitAdmins(io, event, payload) {
  io.to("admins").emit(event, payload);
}

module.exports = { registerSocketHandlers, emitAdmins };

