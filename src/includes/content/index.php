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

$extList = "";

$modules = Abricos::$modules->RegisterAllModule();

foreach ($modules as $name => $module){
    if (!method_exists($module, 'Bos_IsExtension')){
        continue;
    }
    if (!$module->Bos_IsExtension()){
        continue;
    }
    $man = $module->GetManager();

    if (!method_exists($man, 'Bos_ExtensionData')){
        continue;
    }
    $data = $man->Bos_ExtensionData();
    if (!is_array($data)){
        continue;
    }
    $data['module'] = $name;
    $extList .= Brick::ReplaceVarByData($v['ext'], $data);
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    'extList' => $extList
));

?>