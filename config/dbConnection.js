var mongo = require("mongodb").MongoClient;
var assert = require("assert");

const cloud = true;

var mongodbHost = 'localhost';
var mongodbPort = '27017';
var authenticate ='';

if (cloud) {
    mongodbHost = 'ds145694.mlab.com';
    mongodbPort = '45694';
    authenticate = 'testeUser:testeUser10@';
}

const mongodbDatabase = "sis_plataformas";

// connect string for mongodb server running locally, connecting to a database called test
var url = 'mongodb://'+authenticate+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase;

var connMongoDB = function(dados) {
    mongo.connect(url, function(err, client) {
        assert.equal(null, err);
        const db = client.db(mongodbDatabase);
        query(db, dados);
        client.close();
    });
};

function query(db, dados) {
    var collection = db.collection(dados.collection);
    switch (dados.operacao) {
        case "inserir":
            collection.insertMany(dados.documento, dados.callback);
            break;
        case "consultar":
            collection.find(dados.documento, dados.callback);
            break;
        case "get10UltimosHorarios":
            collection.find(dados.documento, dados.options, dados.callback);
            break;
        case "atualizar":
            collection.updateOne(dados.documento, dados.newDocumento, dados.callback);
            break;
        case "deletar":
            collection.deleteOne(dados.documento, dados.callback);
            break;
        default:
            break;
    }
}

module.exports = function() {
    return connMongoDB;
};
