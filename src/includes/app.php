<?php
/**
 * @package Abricos
 * @subpackage Bos
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License (MIT)
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

require_once 'models.php';

/**
 * Class Bos
 *
 * @property BosManager $manager
 */
class BosApp extends AbricosApplication {

    protected $_cache = array();

    protected function GetClasses(){
        return array(
            'Summary' => 'BosSummary',
            'SummaryList' => 'BosSummaryList'
        );
    }

    protected function GetStructures(){
        return 'Summary';
    }

    public function ResponseToJSON($d){
        switch ($d->do){
            case 'summaryList':
                return $this->SummaryListToJSON();
        }
        return null;
    }

    public function SummaryListToJSON(){
        $ret = $this->SummaryList();
        return $this->ResultToJSON('summaryList', $ret);
    }


    public function SummaryList(){
        $list = $this->models->InstanceClass('SummaryList');

        $modules = Abricos::$modules->RegisterAllModule();

        foreach ($modules as $name => $module){
            if (!method_exists($module, 'Bos_IsSummary') || !$module->Bos_IsSummary()){
                continue;
            }

            $man = $module->GetManager();

            if (!method_exists($man, 'Bos_SummaryData')){
                continue;
            }

            $data = $man->Bos_SummaryData();
            if (is_array($data)){
                foreach ($data as $dItem){
                    if (!is_array($dItem)){
                        continue;
                    }
                    if (!isset($dItem['module'])){
                        $dItem['module'] = $name;
                    }
                    if (!isset($dItem['component'])){
                        $dItem['component'] = 'summary';
                    }
                    if (!isset($dItem['widget'])){
                        $dItem['widget'] = 'SummaryWidget';
                    }
                    if (!isset($dItem['id'])){
                        $dItem['id'] = $dItem['module'].'-'.$dItem['component'].'-'.$dItem['widget'];
                    }
                    $list->Add($this->models->InstanceClass('Summary', $dItem));
                }
            }
        }
        return $list;
    }
}

?>