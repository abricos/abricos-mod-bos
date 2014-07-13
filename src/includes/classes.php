<?php

class BosMenuItem {

    public $name;
    public $title;
    public $parent;
    public $url;
    public $icon;
    public $role;
    public $childs = array();

    public function __construct($d = array()) {
        if (!is_array($d)) {
            return;
        }
        $this->name = $d['name'];
        $this->title = $d['title'];
        $this->parent = $d['parent'];
        $this->url = $d['url'];
        $this->icon = $d['icon'];
        $this->role = $d['role'];
    }
}

?>