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

/* 
 
 // Отключить иконки приложений модулей 
 $config['module']['bos']['labels']['disable'] = array("MODNAME");
 
 */

class BosModule extends Ab_Module {
	
	/**
	 * Конструктор
	 */
	public function __construct(){
		// Версия модуля
		$this->version = "0.1.5";
		
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
	
	public function GetLink(){
		return $this->registry->adress->host."/".$this->takelink."/";
	}
	
	public function RSS_GetItemList(){
		$mod = Abricos::GetModule('rss');
		$onemod = $this->registry->adress->dir[2];
		
		return $mod->RSS_GetItemListAll(true, $onemod);
	}
}

Abricos::ModuleRegister(new BosModule());

?>