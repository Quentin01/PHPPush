<?php
require 'Client.php';

use \PHPPush\Client as Client;

class PHPPush {
	protected $events = array();
	protected $clients = array();
	
	public $currentClient = null;
	
	public function __construct() {
		if(!isset($_SESSION['phppush']['id']))
		{
			do {
				$id = md5(microtime());
			} while($this->clientExists($id));
			
			$_SESSION['phppush']['id'] = $id;
		}
	
		$this->currentClient = new Client($_SESSION['phppush']['id']);
	}
	
	protected function clientExists($id)
	{
		return file_exists(__DIR__ . '/../pipes/clients/' . $id);
	}
	
	public function on($name, $callback)
	{
		$this->events[$name] = $callback;
	}
	
	public function lauch()
	{
		
		
		
		
		
		
		
		
		
		
		
		foreach($this->clients as $client)
		{
			$client->save();
		}
		
		exit();
	}
}
