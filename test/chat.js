/* Initialisation */

// Le pseudo

var nick = 'Anonyme';

// Lorsque la page est chargé on se connecte / quand l'utilisateur quitte la page on se déconnecte

window.onload = function() {
	afficherConnexion();
	
	PHPPush.connect('server.php', 500);
	PHPPush.launch();
	
	// On demande au serveur si on est déjà connecté
	PHPPush.emit('isAlreadyConnect');
};

/* Reception d'evenements */

// La connexion à échoué
PHPPush.on('connexionFailed', function(message) {
	addErrorMessage("Connexion failed : " + message);
});
			
// La connexion a réussit
PHPPush.on('connexionSucces', function() {
	afficherDeconnexion();
	addAgreeMessage("Vous vous êtes bien connecté avec le pseudo " + nick);
});		

// On a recu un message
PHPPush.on('message', function(data) {
	addUserMessage(data.nick, data.message);
});

// Quelqu'un vient de se connecter	
PHPPush.on('connexion', function(nick) {
	addAgreeMessage(nick + " vient de se connecter !");
	addUser(nick);
});

// Quelqu'un vient de se déconnecter		
PHPPush.on('deconnexion', function(nick) {
	addErrorMessage(nick + " vient de se déconnecter !");
	removeUser(nick);
});

// On est déjà connecté quand on a chargé la page
PHPPush.on('alreadyConnect', function(nickname) {
	nick = nickname;
	afficherDeconnexion();
});

// On a reçu la liste des membres connectés actuellement		
PHPPush.on('memberList', function(users) {
	for (var i = 0; i < users.length; i++) {
		addUser(users[i]);
	}
});

/* Différentes fonctions appelées suite à des événements */

function connexion(nick) {
	PHPPush.emit('connexion', nick);
	document.getElementById('users-box').innerHTML = "";
}
			
function deconnexion() {
	PHPPush.emit('deconnexion');
	document.getElementById('users-box').innerHTML = "";
}
			
function sendMessage(message) {
	PHPPush.emit('message', message);
}

/* Fonction d'affichage des différents éléments */

function afficherConnexion() {
	var top = document.getElementById('top');
	top.innerHTML = '';
				
	var text = document.createTextNode("Nick : ");
	top.appendChild(text);
				
	var inputNick = document.createElement('input');
	inputNick.value = nick;
	inputNick.type = "text";
	top.appendChild(inputNick);
				
	var text = document.createTextNode(" - ");
	top.appendChild(text);
				
	var linkConnexion = document.createElement('a');
	linkConnexion.href = "#";
	linkConnexion.appendChild(document.createTextNode("Connexion"));
	top.appendChild(linkConnexion);
				
	hideBottom();
				
	linkConnexion.onclick = function() {
		nick = inputNick.value;
		connexion(nick);
	};
}

function showBottom() {
	hideBottom();
				
	var bottom = document.getElementById('bottom');
				
	var inputMessage = document.createElement('input');
	inputMessage.placeholder = "Votre message ...";
	inputMessage.type = "text";
	inputMessage.id = "message";
	inputMessage.style.width = "84%";
	inputMessage.autocomplete = "off";
				
	bottom.appendChild(inputMessage);
				
	inputMessage.onkeypress = function(e) {
		var keyCode = e.keyCode;
		
		if(keyCode == 13)
		{
			var message = inputMessage.value;
			inputMessage.value = "";
	
			sendMessage(message);
		}
	};
}

function hideBottom() {
	var bottom = document.getElementById('bottom');
	bottom.innerHTML = "";
}

function afficherDeconnexion() {
	var top = document.getElementById('top');
	top.innerHTML = '';
				
	var text = document.createTextNode("Bienvenue ");
	top.appendChild(text);
				
	var strongNick = document.createElement('strong');
	strongNick.appendChild(document.createTextNode(nick));
	top.appendChild(strongNick);
				
	var text = document.createTextNode(" - ");
	top.appendChild(text);
				
	var linkDeconnexion = document.createElement('a');
	linkDeconnexion.href = "#";
	linkDeconnexion.appendChild(document.createTextNode("Deconnexion"));
	top.appendChild(linkDeconnexion);
				
	showBottom()
				
	linkDeconnexion.onclick = function() {
		deconnexion();
		addErrorMessage("Vous venez de vous déconnecter !");
		afficherConnexion();
	};
}

function scroolBottom()
{
	document.getElementById('messages-box').scrollTop = document.getElementById('messages-box').scrollHeight; 
}

function addUserMessage(nick, message)
{
	var messagesBox = document.getElementById('messages-box');
				
	var divMessage = document.createElement('div');
	divMessage.className = "userMessage";
				
	var strongNick = document.createElement('strong');
	strongNick.appendChild(document.createTextNode(nick));
	divMessage.appendChild(strongNick);
				
	var text = document.createTextNode(" : " + message);
	divMessage.appendChild(text);
				
	messagesBox.appendChild(divMessage);
	scroolBottom();
}
			
function addErrorMessage(message)
{
	var messagesBox = document.getElementById('messages-box');
				
	var divMessage = document.createElement('div');
	divMessage.className = "errorMessage";
				
	var text = document.createTextNode(message);
	divMessage.appendChild(text);
				
	messagesBox.appendChild(divMessage);
	scroolBottom();
}
			
function addAgreeMessage(message)
{
	var messagesBox = document.getElementById('messages-box');
				
	var divMessage = document.createElement('div');
	divMessage.className = "agreeMessage";
				
	var text = document.createTextNode(message);
	divMessage.appendChild(text);
				
	messagesBox.appendChild(divMessage);
	scroolBottom();
}
			
function addUser(nick)
{
	var usersBox = document.getElementById('users-box');
				
	var divUser = document.createElement('div');
	divUser.className = "user";
				
	var text = document.createTextNode(nick);
	divUser.appendChild(text);
				
	usersBox.appendChild(divUser);
}
			
function removeUser(nick)
{
	var usersBox = document.getElementById('users-box');
	var children  = usersBox.childNodes;
				
	var text = '';

	for (var i = 0, c = children.length; i < c; i++) {
		text = children[i].textContent || children[i].innerText || '';
			
		if(text == nick)
		{
			usersBox.removeChild(children[i]);
			return;
		}
	}
}

