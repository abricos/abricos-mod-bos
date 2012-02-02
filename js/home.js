/*
@version $Id$
@package Abricos
@copyright Copyright (C) 2008-2011 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	mod:[
		{name: 'sys', files: ['container.js']}
	]
};
Component.entryPoint = function(NS){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;
	
	var TMG = this.template,
		initCSS = false,
		buildTemplate = function(w, ts){
		if (!initCSS){
			Brick.util.CSS.update(Brick.util.CSS['{C#MODNAME}']['{C#COMNAME}']);
			delete Brick.util.CSS['{C#MODNAME}']['{C#COMNAME}'];
			initCSS = true;
		}
		w._TM = TMG.build(ts); w._T = w._TM.data; w._TId = w._TM.idManager;
	};
	var HomePanel = function(){
		HomePanel.superclass.constructor.call(this, {
			fixedcenter: true, width: '790px', height: '400px'
		});
	};
	YAHOO.extend(HomePanel, Brick.widget.Panel, {
		initTemplate: function(){
			buildTemplate(this, 'panel');
			return this._TM.replace('panel');
		}
	});
	NS.HomePanel = HomePanel;
	
	var activePanel = null;
	NS.API.showHomePanel = function(){
		if (L.isNull(activePanel) || activePanel.isDestroy()){
			activePanel = new HomePanel();
		}
		return activePanel;
	};
};