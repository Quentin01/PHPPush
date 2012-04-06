<?php

namespace PHPPush;

class Client implements \ArrayAccess {
	protected $id;
	protected $file;
	protected $server;
	
	protected $lastRecoveryData = 0;
	protected $data = array();
	
	public function __construct($id, $server)
	{
		$this->id = $id;
		$this->file = __DIR__ . '/../pipes/clients/' . $this->id;
		$this->server = $server;
		
		$this->data["id"] = $this->id;
		
		if(file_exists($this->file))
			$this->loadData();
		else
			$this->save();
	}
	
	public function offsetGet($name)
	{
		$this->checkData();
		
		if($this->offsetExists($name))
		{
			return $this->data[$name];
		}
	}
	
	public function offsetExists($name)
	{
		return isset($this->data[$name]);
	}
	
	public function offsetSet($name, $value)
	{
		$this->checkData();
		
		$this->data[$name] = $value;
		$this->save();
	}
	
	public function offsetUnset($name)
	{
		if($this->offsetExists($name))
		{
			unset($this->data[$name]);
			$this->save();
		}
	}
	
	public function checkData()
	{
		if(filemtime($this->file) >= $this->lastRecoveryData)
		{
			$this->loadData();
		}
	}
	
	public function loadData()
	{
		$this->lastRecoveryData = time();
		$this->data = unserialize(file_get_contents($this->file));
	}
	
	public function save()
	{
		file_put_contents($this->file, serialize($this->data));
		$this->lastRecoveryData = time();
	}
	
	public function emit($event, $data)
	{
		$this->server->addEvent($this['id'], $event, $data);
	}
	
	public function broadcast($event, $data)
	{
		foreach($this->server->getClients() as $client)
		{
			if($client['id'] != $this['id'])
				$this->server->addEvent($client['id'], $event, $data);
		}
		
		if($this->server->currentClient['id'] != $this['id'])
			$this->server->addEvent($this->server->currentClient['id'], $event, $data);
	}
}
