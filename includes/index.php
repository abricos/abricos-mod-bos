<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$brick = Brick::$builder->brick;

$user = Abricos::$user->info;

$unm = $user['username'];
$lnm = $user['lastname'];
$fnm = $user['firstname'];

$username = empty($lnm) && empty($fnm) ? $unm : $fnm."&nbsp;".$lnm;

$modRSS = Abricos::GetModule('rss');

$cfg = Abricos::$config['module']['bos'];

$labelscfg = "{}";
if (!empty($cfg['labels']) && !empty($cfg['labels']['disable']) && is_array($cfg['labels']['disable'])){
	$labelscfg = json_encode($cfg['labels']);
}

$brick->content = Brick::ReplaceVarByData($brick->content, array(
	"userid" => $user['userid'],
	"username" => $username,
	"labelscfg" => $labelscfg,
	"rss" => (!empty($modRSS) ? $brick->param->var['rss'] : "")
));
 
?>