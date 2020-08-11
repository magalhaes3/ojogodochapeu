const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});

let listaPapeis = [];

io.on('connection', (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.emit('papeisAnteriores', listaPapeis);

    socket.on('papelSubmetido', data => {
        // data.id = listaPapeis.length;
        listaPapeis.push(data);
        socket.emit('atualizarPapeisProprios', data);
        socket.emit('receivedMessage', listaPapeis.length);
        socket.broadcast.emit('receivedMessage', listaPapeis.length);
    });

    socket.on('papelAberto', retirar => {
        let i = Math.floor(Math.random() * listaPapeis.length);

        let papelEscolhido = listaPapeis[i];
       
        let retirado = false;
        if (retirar) {
            let filtered = listaPapeis.filter((elm) => {
                return elm !== papelEscolhido;
            });
            listaPapeis = filtered;
            retirado = true;
        } else {
            listaPapeis[i].aberto = true;
        }
        socket.emit('papelAberto', {listaPapeis, papelEscolhido, retirado, user: true});
        socket.broadcast.emit('papelAberto', {listaPapeis, papelEscolhido, retirado});
    });

    socket.on('apagarTudo', () => {
        listaPapeis = [];
        socket.emit('apagarTudo');
        socket.broadcast.emit('apagarTudo');
    })
});

server.listen(process.env.PORT || 3001);