<?php
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Bos
 * @copyright Copyright (C) 2011 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

class BosManager extends Ab_ModuleManager {
	
	/**
	 * @var BosModule
	 */
	public $module = null;
	
	/**
	 * @var BosManager
	 */
	public static $instance = null; 
	
	public function __construct(BosModule $module){
		parent::__construct($module);
		
		BosManager::$instance = $this;
	}
	
	private function _AJAX($modname, $data){
		$module = Abricos::GetModule($modname);
		if (empty($module)){ 
			return null; 
		}
		$manager = $module->GetManager();
		return $manager->AJAX($data);
	}
	
	public function AJAX($d){
		$ret = new stdClass();
		$ret->u = $this->userid;
		$ret->r = $this->_AJAX($d->nm, $d->d);
		
		return $ret;
	}
	
}

?>