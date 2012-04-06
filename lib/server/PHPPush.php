<?php
require 'Client.php';

use \PHPPush\Client as Client;

class PHPPush {
	protected $clients = array();
	
	public $currentClient = null;
	
	public function __construct() {
		header('Content-Type : text/plain; charset=UTF-8');
		
		if(!isset($_SESSION['phppush']['id']))
		{
			do {
				$id = md5(microtime());
			} while($this->clientExists($id));
			
			$_SESSION['phppush']['id'] = $id;
		}
	
		$this->currentClient = new Client($_SESSION['phppush']['id'], $this);
		$this->currentClient['lastConnection'] = time();
		
		$dirClients = opendir(__DIR__ . '/../pipes/clients/'); 

		while($file = readdir($dirClients)) {
			if(substr($file, 0, 1) != '.' && !is_dir($dirClients.$file) && $file != $_SESSION['phppush']['id'])
			{
				$this->clients[$file] = new Client($file, $this);
			}
		}

		closedir($dirClients);
	}
	
	protected function clientExists($id)
	{
		return file_exists(__DIR__ . '/../pipes/clients/' . $id);
	}
	
	public function addEvent($id, $event, $data)
	{
		$messagesDir = __DIR__ . '/../pipes/messages/';
		$messagesFile = $messagesDir . $id;
		
		$dataEvent = array();
			
		if(file_exists($messagesFile))
		{
			$dataEvent = json_decode(file_get_contents($messagesFile));
		}
			
		$dataEvent[] = array('event' => $event, 'data' => json_encode($data));
		file_put_contents($messagesFile, json_encode($dataEvent));
	}
	
	public function emit($event, $data)
	{
		$messagesDir = __DIR__ . '/../pipes/messages/';
		
		$this->broadCast($event, $data);
		$this->addEvent($this->currentClient['id'], $event, $data);
	}
	
	public function broadcast($event, $data)
	{
		$messagesDir = __DIR__ . '/../pipes/messages/';
		
		foreach($this->clients as $client)
		{
			$this->addEvent($client['id'], $event, $data);
		}
	}
	
	public function launch()
	{
		$messagesDir = __DIR__ . '/../pipes/messages/';
		$messagesFile = $messagesDir . $this->currentClient["id"];
		
		if(isset($_POST['event']))
		{
			$event = $_POST['event'];
			$data = json_decode($_POST['data']);
			
			$methodName = 'on' . ucfirst($event);
			
			if(method_exists($this, $methodName))
			{
				$this->$methodName($data);
			}
			
			exit();
		}
		elseif(isset($_POST['get']))
		{
			if(file_exists($messagesFile))
			{
				echo file_get_contents($messagesFile);
				unlink($messagesFile);
			}
			else
			{
				echo json_encode(array());
			}
		}
	}
	
	public function getClients()
	{
		return $this->clients;
	}
}
