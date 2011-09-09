<?php
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Bos
 * @copyright Copyright (C) 2011 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

$brick = Brick::$builder->brick;

$user = CMSRegistry::$instance->user->info;

$unm = $user['username'];
$lnm = $user['lastname'];
$fnm = $user['firstname'];

$username = empty($lnm) && empty($fnm) ? $unm : $fnm."&nbsp;".$lnm;

$brick->content = Brick::ReplaceVarByData($brick->content, array(
	"userid" => $user['userid'],
	"username" => $username
));
 
?>