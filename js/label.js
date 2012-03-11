/*
@version $Id: os.js 1413 2012-02-02 09:09:11Z roosit $
@copyright Copyright (C) 2011 Abricos All rights reserved.
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

    var LabelListWidget = function(container){
    	this.init(container);
    };
    LabelListWidget.prototype = {
    	init: function(container){
    		
    		var TM = buildTemplate(this, 'labellist,label');
    		container.innerHTML = TM.replace('labellist', {'list': ''});
    		
    		this.element = TM.getEl('labellist.id');
    		
			var list = [];
			// сформировать список модулей имеющих компонент 'app' в наличие
			for (var m in Brick.Modules){
				if (Brick.componentExists(m, 'appbos') && !Brick.componentLoaded(m, 'appbos')){
					list[list.length] = {name: m, files:['appbos.js']};
				}
			}
			var __self = this;
			if (list.length > 0){
				Brick.Loader.add({ 
					mod: list,
					onSuccess: function() { 
						__self.onLoadLabels(); 
					}
				});
			}else{
				__self.onLoadLabels(); 
			}
    	},
    	
		renderLabel: function(app){
			var TM = this._TM,
				mod = app.moduleName,
				am = mod.split('/');
			
			if (am.length == 2){
				var ah = am[0].split(':'),
					port = 80;
				if (ah.length == 2 && ah[1]*1 > 0){
					port = ah[1]*1;
				}
				mod = ah[0]+"\t"+port+"\t"+am[1];
			}
			
			mod = encodeURIComponent(mod);
			
			TM.getEl('labellist.id').innerHTML += TM.replace('label', {
				'id': app.id,
				'mod': mod,
				'comp': app.entryComponent,
				'name': app.moduleName+'-'+app.entryComponent,
				'page': app.entryPoint,
				'icon': app.icon,
				'title': app.getTitle()
			});
		},
		
    	onLoadLabels: function(){

			NS.ApplicationManager.startupEach(function(f){
				f();
			});
			
			var __self = this;
			
			NS.ApplicationManager.each(function(app){
				__self.renderLabel(app);
			});
			
			NS.ApplicationManager.startupAfterEach(function(f){
				f();
			});
    	}
    };
    NS.LabelListWidget = LabelListWidget;

};