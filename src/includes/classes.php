<?php

class BosMenuItem {

    public $name;
    public $title;
    public $parent;
    public $url;
    public $icon;
    public $role;
    public $order;
    public $childs = array();

    public $sortKey;

    public function __construct($d = array()) {
        if (!is_array($d)) {
            return;
        }
        $this->name = strval($d['name']);
        $this->title = strval($d['title']);
        $this->parent = strval($d['parent']);
        $this->url = strval($d['url']);
        $this->icon = strval($d['icon']);
        $this->role = $d['role'];
        $this->order = intval($d['order']);

        $sOrd = strval(1000000-$this->order);
        $this->sortKey = str_repeat("0", 9 - strlen($sOrd)).$sOrd."_".$this->title."_".$this->name;
    }
}

?>