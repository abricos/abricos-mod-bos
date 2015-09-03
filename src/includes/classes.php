<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License (MIT)
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class BosMenuItem
 */
class BosMenuItem {

    /**
     * @var Ab_Module
     */
    public $module;
    public $name;
    public $title;
    public $descript;
    public $parent;
    public $url;
    public $method;
    public $component;
    public $icon;
    public $role;
    public $order;
    public $childs = array();
    public $isParent = false;

    public $sortKey;

    public function __construct($module, $d = array()) {
        $this->module = $module;
        if (!is_array($d)) {
            return;
        }

        $this->name = strval($d['name']);
        $this->title = strval($d['title']);
        $this->descript = isset($d['descript']) ? strval($d['descript']) : "";
        $this->parent = isset($d['parent']) ? strval($d['parent']) : '';
        $this->url = isset($d['url']) ? strval($d['url']) : "";
        $this->method = isset($d['method']) ? strval($d['method']) : "";
        $this->component = isset($d['component']) ? strval($d['component']) : "";
        $this->icon = strval($d['icon']);
        $this->role = isset($d['role']) ? intval($d['role']) : 0;
        $this->order = isset($d['order']) ? intval($d['order']) : 0;

        $sOrd = strval(1000000 - $this->order);
        $this->sortKey = str_repeat("0", 9 - strlen($sOrd)).$sOrd."_".$this->title."_".$this->name;

        $this->isParent = !empty($d['isParent']);
    }
}

?>