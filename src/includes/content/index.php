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

$user = Abricos::$user;

$unm = $user->username;
$lnm = $user->lastname;
$fnm = $user->firstname;

$username = empty($lnm) && empty($fnm) ? $unm : $fnm."&nbsp;".$lnm;

$modRSS = Abricos::GetModule('rss');

$cfg = isset(Abricos::$config['module']['bos']) ? Abricos::$config['module']['bos'] : array();

$labelscfg = "{}";
if (!empty($cfg['labels']) && !empty($cfg['labels']['disable']) && is_array($cfg['labels']['disable'])) {
    $labelscfg = json_encode($cfg['labels']);
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
    "userid" => $user->id,
    "username" => $username,
    "labelscfg" => $labelscfg
));

?>