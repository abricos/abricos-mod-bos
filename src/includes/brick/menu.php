<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License (MIT)
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$brick = Brick::$builder->brick;
$v = &$brick->param->var;
$p = &$brick->param->param;

Abricos::GetModule('bos')->GetManager();

$modules = Abricos::$modules->RegisterAllModule();

$isViewChild = empty($p['noChild']);

$sortItems = array();
$menu = array();

foreach ($modules as $name => $module){
    if (!method_exists($module, 'Bos_IsMenu')){
        continue;
    }
    if (!$module->Bos_IsMenu($p)){
        continue;
    }
    $man = $module->GetManager();

    if (!method_exists($man, 'Bos_MenuData')){
        continue;
    }
    $data = $man->Bos_MenuData($p);
    if (is_array($data)){
        foreach ($data as $dItem){
            $item = new BosMenuItem($module, $dItem);
            if (!empty($item->role) && !$man->IsRoleEnable($item->role)){
                continue;
            }

            $sortItems[$item->sortKey] = $item;
        }
    }
}
ksort($sortItems);

$items = array();
foreach ($sortItems as $item){
    $items[$item->name] = $item;
}

// set group items
foreach ($items as $item){
    if ($item->isParent){
        $menu[$item->name] = $item;
    }
}

$rootItemCount = 0;
foreach ($items as $item){
    // clean parent if not found
    if (!empty($item->parent) && empty($menu[$item->parent])){
        $item->parent = "";
    }

    if (empty($item->parent)){
        $rootItemCount++;
    }
}

// group items
if ($rootItemCount > 7 && $isViewChild){
    foreach ($items as $item){
        if (!empty($item->group) && !empty($menu[$item->group])){
            $item->parent = $item->group;
        }
    }
}

foreach ($items as $item){
    if (!empty($menu[$item->parent])){
        $menu[$item->parent]->childs[] = $item;
    } else {
        $menu[$item->name] = $item;
    }
}


$lst = "";
foreach ($menu as $item){
    /** @var $item BosMenuItem */

    if ($item->isParent && count($item->childs) === 0){
        continue;
    }

    $childs = "";
    if (count($item->childs) > 0 && $isViewChild){
        foreach ($item->childs as $subItem){
            /** @var $subItem BosMenuItem */
            $childs .= Brick::ReplaceVarByData($v['item'], array(
                "module" => $subItem->module->name,
                "name" => $subItem->name,
                "title" => $subItem->title,
                "descript" => $subItem->descript,
                "method" => $subItem->method,
                "component" => $subItem->component,
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
        "module" => $item->module->name,
        "name" => $item->name,
        "title" => $item->title,
        "descript" => $item->descript,
        "method" => $item->method,
        "component" => $item->component,
        "url" => (empty($childs) && !empty($item->url)) ? ($p['urlprefix'].$item->url) : "#",
        "icon" => empty($item->icon) ? "" : Brick::ReplaceVarByData($v['icon'], array(
            "src" => $item->icon
        )),
        "childs" => $childs
    ));
}

if (empty($p['noWrap'])){
    $result = Brick::ReplaceVarByData($v['wrap'], array(
        "result" => $lst
    ));
} else {
    if (empty($lst)){
        return $brick->content = "";
    }
    $result = $lst;
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    "result" => $result
));
