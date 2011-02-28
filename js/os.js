/*
@version $Id$
@copyright Copyright (C) 2008 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

/**
 * @module Bos
 * @namespace Brick.mod.bos
 */

var Component = new Brick.Component();
Component.requires = {
	yahoo: ['dom', 'history'],
	mod:[
	     {name: 'sys', files: ['container.js']},
	     {name: 'user', files: ['permission.js']}
	]
};
Component.entryPoint = function(){
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		H = YAHOO.util.History;

	var NS = this.namespace,
		API = NS.API,
		TMG = this.template;
	
	
	NS.logout = function(){
		alert('logout');
	};
	
	/**
	 * Приложение BOS.
	 * 
	 * @class Application
	 * @constructor
	 * @param {String} moduleName Имя модуля которому принадлежит приложение.
	 * @param {String} name Имя приложения
	 */
	var Application = function(moduleName, name){
		var a=[moduleName];
		if (name){a[a.length] = name; }
		
		this.id = a.join('-');
		
		name = name || moduleName;
		
		/**
		 * Имя модуля.
		 * @property moduleName
		 * @type String
		 */
		this.moduleName = moduleName;
		
		/**
		 * Имя приложения
		 * @property name
		 * @type String
		 * @default <i>moduleName</i>
		 */
		this.name = name;
		
		/**
		 * Надпись меню
		 * @property title
		 * @type String
		 */
		this.title = '';
		
		/**
		 * Идентификатор надписи в менеджере фраз. Например: "mod.user.cp.title"
		 * @property titleId
		 * @type String
		 * @default mod.<i>moduleName</i>.cp.title
		 */
		this.titleId = "mod."+moduleName+'.app.title';
		
		/**
		 * Путь к иконке
		 * @property icon
		 * @type String
		 * @default modules/user/css/images/cp_icon_default.gif
		 */
		this.icon = "";
		
		/**
		 * Компонент модуля, который должен быть загружен, 
		 * когда будет клик по ярлыку приложения.<br>
		 * Установите значение пустым, если подгрузка компонента не нужна.  
		 * @property entryComponent
		 * @type String
		 */
		this.entryComponent = '';
		
		/**
		 * Точка входа (функция), которая будет выполнена по клику на ярлык. 
		 * @property entryPoint
		 * @type String | Function
		 */
		this.entryPoint = null;
		
		/**
		 * Получить надпись.
		 * 
		 * @method getTitle
		 * @return {String}  
		 */
		this.getTitle = function(){
			var phrase = Brick.util.Language.getc(this.titleId);
			if (L.isString(phrase)){
				return phrase;
			}
			return this.title != '' ? this.title : this.name; 
		};
	};
	NS.Application = Application;	

	var ApplicationManager = new (function(){
		
		var apps = [];

		// зарегистрировать приложение
		this.register = function(app){
			apps[apps.length] = app;
		};
		
		this.each = function(func){
			for (var i=0;i<apps.length;i++){
				if (func(apps[i])){
					return apps[i];
				}
			}
			return null;
		};
		
		this.getById = function(id){
			for (var i=0;i<apps.length;i++){
				if (apps[i].id == id){ return apps[i]; }
			}
			return null;
		}; 
		
	});
	NS.ApplicationManager = ApplicationManager;
	
	var findA = function(el, cnt){
        cnt = cnt||1;
		if (!el || L.isNull(el) || el.parentNode == document.body || cnt > 30){ return null; }
		if (el.tagName == 'A'){ return el; }
        return findA(el.parentNode, cnt+1);
	};

	
	var Workspace = function(){
		this.init();
	};
	Workspace.instance = null;
	Workspace.prototype = {
		
		init: function(){
			Workspace.instance = this;
			
			this.selectedApp = null;
			
			var TM = TMG.build('menuitem,page'), T = TM.data, TId = TM.idManager;
			this._T = T; this._TId = TId; this._TM = TM;
			
			var container = Dom.get("home");
			this.container = container;
			

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
						__self.render(); 
					}
				});
			}else{
				__self.render(); 
			}
			
			E.on(container, "click", function (evt) {
				var el = findA(E.getTarget(evt));
				if (L.isNull(el)){ return; }
				var href = el.getAttribute('href');

				var newApp = H.getQueryStringParameter("app", href) || "home";
				var currApp = H.getCurrentState("app", href);
				if (newApp != currApp){
					H.navigate("app", newApp);
				}
				E.preventDefault(evt);
			});
		},
		
		_setWorkspaceSize: function(){
			var r = Dom.getClientRegion();
			var el = this.container;
			
            Dom.setStyle(el, "width", (r.width)+'px');
            Dom.setStyle(el, "height", (r.height-32)+'px');
            this.orderLabelPosition();
		},
		
		render: function(){
			var __self = this, lst = "", TM = this._TM;
			NS.ApplicationManager.each(function(app){
				lst += TM.replace('menuitem', {
					'id': app.id,
					'name': app.name,
					'icon': app.icon,
					'title': app.getTitle()
				});
			});
			
			this.container.innerHTML = lst;
			
			var __self = this;
			var bookmarkedSection = H.getBookmarkedState("app") || "home";
			H.register("app", bookmarkedSection, function (appid) {
				__self.openAppById(appid);
			});
			YAHOO.util.History.initialize("yui-history-field", "yui-history-iframe");
		},
		
		openAppById: function(appid){
			var app = NS.ApplicationManager.getById(appid);
			if (L.isNull(app)){ return false; }
			this.openApp(app);
			return true;
		},
		
		showPage: function(appid){
			
			var elId = appid == 'home' ? 'home' : this._TId['page']['id']+'-'+app.id;
			
		},
		
		openApp: function(app){
			if (this.selectedApp == app){ return; }
			var elId = this._TId['page']['id']+'-'+app.id;
			
			var element = Dom.get(elId);
			if (!L.isNull(element)){
				Dom.get('home').style.display = 'none';
				element.style.display = '';
				return;
			}
			
			var div = document.createElement('div');
			div.innerHTML = this._TM.replace('page', {
				'id': app.id 
			});
			element = div.childNodes[0];
			Dom.get('bd').appendChild(element);
			
			var fire = function(){
				var fn = L.isFunction(app.entryPoint) ? app.entryPoint : Brick.convertToObject(app.entryPoint);
				if (!L.isFunction(fn)){ return; }
				
				fn(element);
				Dom.get('home').style.display = 'none';
				element.style.display = '';
			};
			
			if (app.entryComponent != ''){
				if (!Brick.componentLoaded(app.moduleName, app.entryComponent)){
					Brick.Component.API.fireFunction(app.moduleName, app.entryComponent, function(){
						fire();
					});
				}else{
					fire();
				}
			}else{
				fire();
			}
		}

	};
	NS.Workspace = Workspace;
	
	API.buildWorkspace = function(){
		Brick.Permission.load(function(){
			new NS.Workspace();
		});
	};

};