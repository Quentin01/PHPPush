<?php
session_start();
require "../lib/server/PHPPush.php";

class ChatServer extends PHPPush {
	protected $nicks = array();
	
	// On récupére les personnes connectés
	protected function getNicks()
	{
		if(file_exists('nicks'))
		{
			$this->nicks = array_unique(array_merge(unserialize(file_get_contents('nicks')), $this->nicks));
		}
	}
	
	// On sauvegarde les personnes connectés en prenant bien garde à ce que le fichier n'est pas déjà été modifié
	protected function saveNicks()
	{
		$this->getNicks();
		file_put_contents('nicks', serialize($this->nicks));
	}
	
	// On supprime une personne connecté
	protected function delNick($nick)
	{
		$this->getNicks();
		unset($this->nicks[array_search($nick, $this->nicks)]);
		file_put_contents('nicks', serialize($this->nicks));
	}
	
	// L'utilisateur essaye de se connecter
	protected function onConnexion($nick)
	{
		$this->getNicks();
		$this->currentClient->emit('memberList', $this->nicks);
		
		if(array_search($nick, $this->nicks) !== false)
		{
			$this->currentClient->emit('connexionFailed', 'Nick already in use');
			return;
		}
		
		$this->nicks[] = $nick;
		$this->saveNicks();
		
		$this->currentClient['nick'] = $nick;
		
		$this->currentClient->emit('connexionSucces');
		$this->broadcast('connexion', $nick);
	}
	
	// L'utilisateur nous envoit un message
	protected function onMessage($message)
	{
		if(isset($this->currentClient['nick']))
		{
			if(empty($message))
				return;
				
			$this->emit('message', array(
				'nick' => $this->currentClient['nick'],
				'message' => $message
			));
		}
		else
		{
			$this->currentClient->emit('forbid', 'You can\'t send a message without connexion');
		}
	}
	
	// L'utilisateur vient de se déconnecter
	protected function onDeconnexion($data)
	{
		if(isset($this->currentClient['nick']))
		{
			$this->delNick($this->currentClient['nick']);
			$this->broadcast('deconnexion', $this->currentClient['nick']);
			
			unset($this->currentClient['nick']);
		}
	}
	
	// Un utilisateur fait un timeout
	protected function onTimeout($client)
	{
		if(isset($client['nick']))
		{
			$this->delNick($client['nick']);
			$this->broadcast('deconnexion', $client['nick']);
			
			unset($client['nick']);
		}
	}
}
$server = new ChatServer();
$server->launch();
