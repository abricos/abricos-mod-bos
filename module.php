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

class BosModule extends CMSModule {
	
	/**
	 * Конструктор
	 */
	public function __construct(){
		// Версия модуля
		$this->version = "0.1";
		
		// Название модуля
		$this->name = "bos";
		
		// $this->takelink = "__super";
		$this->takelink = "bos";
	}
	
	public function GetContentName(){
		
		if (!CMSRegistry::$instance->user->IsRegistred()){
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

$mod = new BosModule();
CMSRegistry::$instance->modules->Register($mod);

?>