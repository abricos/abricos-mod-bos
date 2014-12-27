<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$brick = Brick::$builder->brick;
$v = &$brick->param->var;
$p = &$brick->param->param;

$modules = Abricos::$modules->RegisterAllModule();

$isViewChild = empty($p['noChild']);

require_once 'classes.php';

$sortItems = array();
$menu = array();

foreach ($modules as $name => $module) {
    if (!method_exists($module, 'Bos_IsMenu')) {
        continue;
    }
    if (!$module->Bos_IsMenu()) {
        continue;
    }
    $man = $module->GetManager();

    if (!method_exists($man, 'Bos_MenuData')) {
        continue;
    }
    $data = $man->Bos_MenuData();
    if (is_array($data)) {
        foreach ($data as $dItem) {
            $item = new BosMenuItem($dItem);
            if (!empty($item->role) && !$man->IsRoleEnable($item->role)) {
                continue;
            }

            $sortItems[$item->sortKey] = $item;
        }
    }
}
ksort($sortItems);

$items = array();
foreach ($sortItems as $item) {
    $items[$item->name] = $item;
}

foreach ($items as $item) {
    if (empty($item->url) || empty($item->parent)) {
        $menu[$item->name] = $item;
    }
}

foreach ($items as $item) {
    if (!empty($item->parent)) {
        if (!empty($menu[$item->parent])) {
            $menu[$item->parent]->childs[] = $item;
        } else {
            $menu[$item->name] = $item;
        }
    }
}

$lst = "";
foreach ($menu as $item) {

    if ($item->isParent && count($item->childs) === 0) {
        continue;
    }

    $childs = "";
    if (count($item->childs) > 0 && $isViewChild) {
        foreach ($item->childs as $subItem) {
            $childs .= Brick::ReplaceVarByData($v['item'], array(
                "title" => $subItem->title,
                "url" => empty($subItem->url) ? "#" : ($p['urlprefix'].$subItem->url),
                "icon" => empty($subItem->icon) ? "" : Brick::ReplaceVarByData($v['icon'], array(
                    "src" => $subItem->icon
                )),
                "childs" => ""
            ));
        }
        $childs = Brick::ReplaceVarByData($v['submenu'], array(
            "childs" => $childs
        ));
    }
    $lst .= Brick::ReplaceVarByData($v[empty($childs) ? 'item' : 'itemwithchilds'], array(
        "title" => $item->title,
        "url" => (empty($childs) && !empty($item->url)) ? ($p['urlprefix'].$item->url) : "#",
        "icon" => empty($item->icon) ? "" : Brick::ReplaceVarByData($v['icon'], array(
            "src" => $item->icon
        )),
        "childs" => $childs
    ));
}

if (empty($p['noWrap'])) {
    $result = Brick::ReplaceVarByData($v['wrap'], array(
        "result" => $lst
    ));
} else {
    $result = $lst;
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    "result" => $result
));

?>