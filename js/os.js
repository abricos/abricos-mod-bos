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
	
	var buildTemplate = function(w, templates){
		var TM = TMG.build(templates), T = TM.data, TId = TM.idManager;
		w._TM = TM; w._T = T; w._TId = TId;
	};
	
	var WaitPanel = function(){
		WaitPanel.superclass.constructor.call(this, {
			fixedcenter: true, width: '350px',
			modal: true
		});
	};
	YAHOO.extend(WaitPanel, Brick.widget.Panel, {
		initTemplate: function(){
			buildTemplate(this, 'waitpanel');
			return this._TM.replace('waitpanel', {
				// 'tl': this.prjTitle
			});
		}
	});
	NS.WaitPanel = WaitPanel;
	
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
	
	/*
	var Page = function(){
		
	};
	Page.prototype = {
		
	};
	/**/
	
	var Workspace = function(){
		this.init();
	};
	Workspace.instance = null;
	Workspace.prototype = {
		
		init: function(){
			Workspace.instance = this;
			
			this.selectedKey = 'home';
			
			var TM = TMG.build('menulist,menuitem,page'), T = TM.data, TId = TM.idManager;
			this._T = T; this._TId = TId; this._TM = TM;
			
			var container = Dom.get("home");
			this.container = container;
			
			this.pages = [{'key': 'home', 'element': container}];
			
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
		
		render: function(){
			var __self = this, lst = "", TM = this._TM;
			NS.ApplicationManager.each(function(app){
				lst += TM.replace('menuitem', {
					'id': app.id,
					'mod': app.moduleName,
					'comp': app.entryComponent,
					'page': app.entryPoint,
					'icon': app.icon,
					'title': app.getTitle()
				});
			});
			
			this.container.innerHTML = TM.replace('menulist', {'rows': lst});
			
			var __self = this;
			var bookmarkedSection = H.getBookmarkedState("app") || "home";
			H.register("app", bookmarkedSection, function (key) {
				__self.navigate(key);
			});
			YAHOO.util.History.initialize("yui-history-field", "yui-history-iframe");
		},
		
		navigate: function(key){
			var arr = key.split('/'),
				mod = arr[0],
				comp = arr[1] || '',
				page = arr[2] || '',
				prm1 = arr[3] || '', prm2=arr[4]||'', prm3=arr[5]||'', prm4=arr[6]||'', prm5=arr[7]||'';
			
			if (this.pageExist(key)){
				this.showPage(key);
				return; 
			}
			if (!Brick.componentExists(mod, comp)){ return; }
			
			var wait = new WaitPanel(),
				TM = this._TM,
				__self = this;
			
			var fire = function(){
				
				wait.close();
				var fn = Brick.mod[mod]['API'][page];
				if (!L.isFunction(fn)){ return; }
				
				var div = document.createElement('div');
				div.innerHTML = TM.replace('page', {
					'id': key.replace(/\//g, '-')
				});
				element = div.childNodes[0];
				Dom.get('pages').appendChild(element);
				
				fn(element, prm1, prm2, prm3, prm4, prm5);
				__self.addPage(key, element);
				__self.showPage(key);
				
				// Dom.get('home').style.display = 'none';
				// element.style.display = '';
			};
			
			if (!Brick.componentLoaded(mod, comp)){
				Brick.Component.API.fireFunction(mod, comp, function(){
					fire();
				});
			}else{
				fire();
			}
		},
		
		showPage: function(key){
			if (this.selectedKey == key){ return; }
			
			// reindex pages
			var ps = this.pages;
			for (var i=0; i<ps.length;i++){
				ps[i]['index'] = i;
			}

			var eBD = Dom.get('bd'),
				ePS = Dom.get('pages'),
				rg = Dom.getRegion(eBD),
				p1 = this.getPage(this.selectedKey), i1 = p1.index, e1 = p1.element,
				p2 = this.getPage(key), i2 = p2.index, e2 = p2.element;
			
			Dom.addClass(eBD, 'movedmode');
			Dom.addClass(ePS, 'movedmode');
			
			var w = rg.width, dx = 50, x = 0;

			Dom.setStyle(ePS, 'width', (w*2+20)+'px');
			if (i1>i2){
				Dom.setStyle(ePS, 'left', (-w)+'px');
				dx = -dx;
				x = -w;
			}

			
			Dom.setStyle(e1, 'float', 'left');
			Dom.setStyle(e1, 'width', w+'px');
			
			Dom.setStyle(e2, 'float', 'left');
			Dom.setStyle(e2, 'width', w+'px');
			Dom.setStyle(e2, 'display', '');
			
			this.selectedKey = key;
			
			var stop = function(){
				e1.style.display = 'none';
				Dom.setStyle(e1, 'float', '');
				Dom.setStyle(e1, 'width', '');
				Dom.setStyle(e2, 'float', '');
				Dom.setStyle(e2, 'width', '');
				Dom.setStyle(ePS, 'width', '');
				Dom.setStyle(ePS, 'left', '');
				
				Dom.removeClass(eBD, 'movedmode');
				Dom.removeClass(ePS, 'movedmode');
			};
			
			var thread = setInterval(function(){
				if (
//						(xc > xn && xn > x) || // движение вперед 
//						(xc < xn && xn < x) // движение назад
						(i1<i2 && x < -(w-dx)) ||
						(i1>i2 && x >= 0)
					){
					clearInterval(thread);
					stop();
					return;
				}
				x -= dx;
				
				Dom.setStyle(ePS, 'left', (x)+'px');
			}, 10);
			
		},
		
		pageExist: function(key){
			return !L.isNull(this.getPage(key));
		},
		
		getPage: function(key){
			var ps = this.pages;
			for (var i in ps){
				if (ps[i]['key'] == key){
					return ps[i];
				}
			}
			return null;
		},
		
		addPage: function(key, element){
			if (this.pageExist(key)){ return; }
			var ps = this.pages;
			ps[ps.length] = {'key': key, 'element': element};
		}
		
		/*
		,
		
		openPage: function(){
			
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
		/**/
	};
	NS.Workspace = Workspace;
	
	API.buildWorkspace = function(){
		Brick.Permission.load(function(){
			new NS.Workspace();
		});
	};

};