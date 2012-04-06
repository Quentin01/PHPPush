<?php

namespace PHPPush;

class Client implements \ArrayAccess {
	protected $id;
	protected $file;
	
	protected $lastRecoveryData = 0;
	protected $data = array();
	
	public function __construct($id)
	{
		$this->id = $id;
		$this->file = __DIR__ . '/../pipes/clients/' . $this->id;
		
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
			return $this->$name;
		}
	}
	
	public function offsetExists($name)
	{
		return isset($this->data[$name]);
	}
	
	public function offsetSet($name, $value)
	{
		$this->checkData();
		$data[$name] = $value;
		
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
		$this->data = json_decode(file_get_contents($this->file));
	}
	
	public function save()
	{
		file_put_contents($this->file, json_encode($this->data));
		$this->lastRecoveryData = time();
	}
}
