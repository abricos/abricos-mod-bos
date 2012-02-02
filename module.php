<?php 
/**
 * Модуль Bos - интерфейс пользователя от компании Brickos (http://brickos.ru)
 * 
 * @version $Id$
 * @package Abricos 
 * @subpackage Webos
 * @copyright Copyright (C) 2011 Abricos All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

class BosModule extends Ab_Module {
	
	/**
	 * Конструктор
	 */
	public function __construct(){
		// Версия модуля
		$this->version = "0.1.2";
		
		// Название модуля
		$this->name = "bos";
		
		// $this->takelink = "__super";
		$this->takelink = "bos";
	}
	
	/**
	 * @return BosManager
	 */
	public function GetManager(){
		if (is_null($this->_manager)){
			require_once 'includes/manager.php';
			$this->_manager = new BosManager($this);
		}
		return $this->_manager;
	}
	
	
	public function GetContentName(){
		
		if (Abricos::$user->id == 0){
			return "index_guest";
		}
		$cname = 'index';
		
		if ($this->registry->adress->level >= 1 && 
			$this->registry->adress->dir[0] == 'upload'){
			$cname = 'upload';
		}
		
		return $cname;
	}
}

Abricos::ModuleRegister(new BosModule());

?>