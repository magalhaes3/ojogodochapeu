var socket = io();

document.getElementById('submit_button').onclick = function() {
    submeterPapel();
}

document.getElementById('retirar_papel').onclick = function() {
    let retirar = document.getElementById('reposicao').checked;
    socket.emit('papelAberto', !retirar);
}

document.getElementById('trash_everything').onclick = function() {
    socket.emit('apagarTudo');
}

function submeterPapel() {
    let papel = document.getElementById('papel_escrito').value;
    if (papel.length) {
        let messageObject = {
            texto: papel,
            aberto: false,
        };
        
        if (localStorage.getItem("papeis") == null) {
            let arr = [messageObject];
            localStorage.setItem("papeis", JSON.stringify(arr));
        } else {
            let papeis = JSON.parse(localStorage.getItem("papeis"));
            papeis.push(messageObject);
            localStorage.setItem("papeis", JSON.stringify(papeis));
        }

        socket.emit('papelSubmetido', messageObject);
    }
    document.getElementById('papel_escrito').value = "";
}

socket.on('papeisAnteriores', function(messages){
    document.getElementById('numero_de_papeis').innerHTML = messages.length;

    if (localStorage.getItem("papeis") !== null) {
        document.getElementById('label_lista_papeis').innerHTML = "Papeis submetidos por si:";
        let papeis = JSON.parse(localStorage.getItem("papeis"));
        papeis.forEach(papel => {
            renderMessage(papel);
        });
    }
});

socket.on('papelAberto', data => {
    if (data.user) {
        document.getElementById('result_placeholder').outerHTML = `<div class="text-center alert alert-success" role="alert" id="result_placeholder">
        O papel escolhido diz: <b>${data.papelEscolhido.texto}</b>
        </div>`
    }

    document.getElementById('numero_de_papeis').innerHTML = data.listaPapeis.length;

    if (localStorage.getItem("papeis") !== null) {
        let papeisLocal = JSON.parse(localStorage.getItem("papeis"));
        if (data.retirado) {
            let papeisAtualizado = intersect(papeisLocal, data.listaPapeis); 

            document.getElementById('lista_papeis').innerHTML = "";
            papeisAtualizado.forEach(papel => {
                renderMessage(papel);
            });
            localStorage.setItem("papeis", JSON.stringify(papeisAtualizado));
            if (papeisAtualizado.length <= 0) {
                document.getElementById('label_lista_papeis').innerHTML = "";
            }
        }
    }
})

socket.on('receivedMessage', function(numDePapeis) {
    document.getElementById('numero_de_papeis').innerHTML = numDePapeis;
});

socket.on('atualizarPapeisProprios', function(data){
    document.getElementById('label_lista_papeis').innerHTML = "Papeis submetidos por si:";
    document.getElementById('lista_papeis').innerHTML += `<li class=\"list-group-item\"> ${data.texto} </li>`
})

socket.on('apagarTudo', function() {
    document.getElementById('label_lista_papeis').innerHTML = "";
    document.getElementById('lista_papeis').innerHTML = "";
    document.getElementById('numero_de_papeis').innerHTML = "0";
    localStorage.setItem("papeis", JSON.stringify([]));
})

function renderMessage(message){
    document.getElementById('lista_papeis').innerHTML += `<li class=\"list-group-item\"> ${message.texto} </li>`;
    // if (message.aberto) {
    //     document.getElementById('lista_papeis').innerHTML += "<li>" + message.texto + "</li>";
    // } else {
    //     document.getElementById('lista_papeis').innerHTML += `<div id=\"${message.id}\" onclick=\"abrirPapel(${message.id})\"> Click me! </div>`;    
    // }
}

function intersect(a1, a2) {
    let res = [];
    a1.forEach(element => {
        a2.forEach(element2 => {
            if (element.texto === element2.texto){
                res.push(element);
            }
        }); 
    });
    return res;
}
