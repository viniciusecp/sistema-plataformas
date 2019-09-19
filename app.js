var app = require("./config/server");

app.listen(process.env.PORT || 8080, function() {
  console.log("Servidor Online na porta 8080");
});
