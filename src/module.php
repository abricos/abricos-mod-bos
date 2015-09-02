<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License (MIT)
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Модуль Bos - интерфейс пользователя
 *
 * @package Abricos
 * @subpackage Bos
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */
class BosModule extends Ab_Module {

    private $_manager = null;

    /**
     * Конструктор
     */
    public function __construct() {
        // Версия модуля
        $this->version = "0.1.7";

        // Название модуля
        $this->name = "bos";

        // $this->takelink = "__super";
        $this->takelink = "bos";
    }

    /**
     * @return BosManager
     */
    public function GetManager() {
        if (is_null($this->_manager)) {
            require_once 'includes/manager.php';
            $this->_manager = new BosManager($this);
        }
        return $this->_manager;
    }

    public function GetContentName() {
        if (Abricos::$user->id == 0) {
            return "index_guest";
        }
        $cname = 'index';

        if (Abricos::$adress->level >= 1 &&
            Abricos::$adress->dir[0] == 'upload'
        ) {
            $cname = 'upload';
        }
        return $cname;
    }

    public function GetLink() {
        return Abricos::$adress->host."/".$this->takelink."/";
    }

    public function RSS_GetItemList() {
        $mod = Abricos::GetModule('rss');
        $onemod = Abricos::$adress->dir[2];

        return $mod->RSS_GetItemListAll(true, $onemod);
    }

    /**
     * Этот модуль добавляет элементы меню в Bos
     * @return bool
     */
    public function Bos_IsMenu(){
        return true;
    }

}

Abricos::ModuleRegister(new BosModule());

?>