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

    public function __construct(BosModule $module) {
        parent::__construct($module);

        BosManager::$instance = $this;
    }

    private function _AJAX($modname, $data) {
        if ($modname == "bos") {
            switch ($data->do) {
                case 'online':
                    return $this->Online($data->mods);
            }
            return null;
        }

        $module = Abricos::GetModule($modname);
        if (empty($module)) {
            return null;
        }
        $manager = $module->GetManager();
        return $manager->AJAX($data);
    }

    public function AJAX($d) {
        $ret = new stdClass();
        $ret->u = $this->userid;
        $ret->r = $this->_AJAX($d->nm, $d->d);

        return $ret;
    }

    public function Online($mods) {
        $ret = array();

        foreach ($mods as $name) {
            $mod = Abricos::GetModule($name);
            if (!method_exists($mod, 'GetManager')) {
                continue;
            }
            $manager = $mod->GetManager();

            if (!method_exists($manager, 'Bos_OnlineData')) {
                continue;
            }

            $r = new stdClass();
            $r->n = $name;
            $r->d = $manager->Bos_OnlineData();

            $ret[] = $r;
        }

        return $ret;
    }

    public function Bos_MenuData() {
        $lng = $this->module->GetI18n();
        return array(
            array(
                "name" => "controlPanel",
                "isParent" => true,
                "order" => "1000",
                "title" => $lng['bosmenu']['controlPanel'],
                "icon" => "/modules/bos/images/cpanel-24.png",
                "url" => "user/board/showBoardPanel"
            )
        );
    }

}

?>