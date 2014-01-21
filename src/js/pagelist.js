/*
@package Abricos
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

/**
 * @module Bos
 * @namespace Brick.mod.bos
 */

var Component = new Brick.Component();
Component.requires = {
	mod:[
	     {name: 'bos', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		H = YAHOO.util.History;

	var buildTemplate = this.buildTemplate;


    var PageListWidget = function(container, owner){
    	this.init(container, owner);
    };
    PageListWidget.prototype = {
    	init: function(container, owner){
    		this.owner = owner;
    		var TM = buildTemplate(this, 'activepanel');

    		container.innerHTML = TM.replace('activepanel');
    		
    		var elSelect = TM.getEl('activepanel.table');
    		
			E.on(elSelect, "change", function (evt) {
				var page = owner.pageManagerWidget.getPageByPanel(elSelect.value);
				if (!L.isNull(page) && page.panel && page.panel._bosOpenedKey){
					Brick.Page.reload("#app="+page.panel._bosOpenedKey);
				}else{
					owner.pageManagerWidget.showPage(elSelect.value);
				}
			});
			
    		var __self = this;
			E.on(container, "click", function (evt) {
				var el = E.getTarget(evt);
				if (__self.onClick(el)){ E.preventDefault(evt); }
			});
    	},
    	onClick: function(el){
    		var TM = this._TM;
    		if (TM.getEl('activepanel.bclose').id == el.id){
    			this.owner.pageManagerWidget.closePage(TM.getEl('activepanel.table').value);
    		}
    		return false;
    	},
    	setPage: function(page){
			var panel = page.panel,
				TM = this._TM,
				elSelect = TM.getEl('activepanel.table'),
				elOptionId = elSelect.id+panel.id,
				elOption = Dom.get(elOptionId);
			
			if (L.isNull(elOption)){
				elOption = document.createElement('option');
				elOption.value = panel.id;
				elOption.id = elOptionId;
				elOption.innerHTML = panel.header.innerHTML;
				elSelect.appendChild(elOption);
			}
			elSelect.value = panel.id;
			TM.getEl('activepanel.tl').innerHTML = panel.header.innerHTML;
			
			var elMflag = TM.getEl('activepanel.mflag');
			var cntp = this.owner.pageManagerWidget.pages.length;
			if (cntp > 1){
				Dom.addClass(elMflag, 'mflag');
			}else{
				Dom.removeClass(elMflag, 'mflag');
			}
    	},
    	removePage: function(page){
    		var TM = this._TM,
    			elSelect = TM.getEl('activepanel.table'),
    			elOption = Dom.get(elSelect.id+page.panel.id);
    		
    		elSelect.removeChild(elOption);
    		TM.getEl('activepanel.tl').innerHTML = '';
    	}
    };
    
    NS.PageListWidget = PageListWidget;

	
};