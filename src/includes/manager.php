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
        return $this->GetApp()->AJAX($d);
    }

    private $_app;

    /**
     * @return Bos
     */
    public function GetApp(){
        if (!is_null($this->_app)){
            return $this->_app;
        }
        $this->module->ScriptRequireOnce(array(
            'includes/app.php'
        ));
        return $this->_app = new BosApp($this);
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
            ),
            array(
                "name" => "personal",
                "isParent" => true,
                "order" => "950",
                "title" => $i18n->Translate('bosmenu.personal'),
                // "icon" => "/modules/bos/images/cpanel-24.png",
                "url" => "bos/wspace/ws"
            ),
            array(
                "name" => "social",
                "isParent" => true,
                "order" => "900",
                "title" => $i18n->Translate('bosmenu.social'),
                // "icon" => "/modules/bos/images/cpanel-24.png",
                "url" => "bos/wspace/ws"
            ),
        );
    }
}

?>