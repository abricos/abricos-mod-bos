<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License (MIT)
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

require_once 'classes.php';

/**
 * Class BosManager
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

    public function AJAX($d){
        return $this->GetBos()->AJAX($d);
    }

    private $_bos;

    /**
     * @return Bos
     */
    public function GetBos(){
        if (!is_null($this->_bos)){
            return $this->_bos;
        }
        require_once 'classes/bos.php';
        return $this->_bos = new Bos($this);
    }

    public function Bos_MenuData(){
        $i18n = $this->module->I18n();
        return array(
            array(
                "name" => "controlPanel",
                "isParent" => true,
                "order" => "1000",
                "title" => $i18n->Translate('bosmenu.controlPanel'),
                "icon" => "/modules/bos/images/cpanel-24.png",
                "url" => "bos/wspace/ws"
            )
        );
    }
}

?>