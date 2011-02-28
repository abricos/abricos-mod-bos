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

$brick->content = Brick::ReplaceVarByData($brick->content, array(
	"username" => CMSRegistry::$instance->user->info['username']
));
 
?>