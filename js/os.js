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

	var BrickPanel = Brick.widget.Panel;
	var Panel = function(config){
		config = config || {};
		
		if (config.modal){
			alert('Use Brick.widget.Dialog for modal panel in BosUI');
	        return;
		}
		
		if (L.isNull(Workspace.instance.declaredKey)){
			alert('Can`t register page in BosUI. DeclaredKey is null');
			return;
		}
		
		this.init(config);
	};
	Panel.prototype = {
		init: function(config){
			var info = Workspace.instance.registerPage(this),
				elPage = info['elPage'];
			elPage.innerHTML = (config.template || this.initTemplate());
			
			var res = Dom.getElementsByClassName('bd', 'div', elPage);
			if (res && res.length >= 1){
				this.body = res[0];
			}
			
			this.onLoad();
			
			Workspace.instance.showPage(info['key']);
			this.onShow();
		},
		onLoad: function(){},
		onShow: function(){},
		destroy: function(){},
		onClick: function(el){ return false; },
		onResize: function(rel){}
	};
	NS.Panel = Panel;
	Brick.widget.Panel = Panel;
	
	var WaitPanel = function(){
		WaitPanel.superclass.constructor.call(this, {
			fixedcenter: true, width: '350px',
			modal: true
		});
	};
	YAHOO.extend(WaitPanel, Brick.widget.Dialog, {
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
	
    var getBookmarkedParameter = function (paramName, url) {

        var i, len, idx, queryString, params, tokens;

        url = url || top.location.href;
        idx = url.indexOf("#");
        queryString = idx >= 0 ? url.substr(idx + 1) : url;

        idx = url.indexOf("?");
        queryString = idx >= 0 ? queryString.substr(idx) : queryString;
        
        params = queryString.split("&");

        for (i = 0, len = params.length; i < len; i++) {
            tokens = params[i].split("=");
            if (tokens.length >= 2) {
                if (tokens[0] === paramName) {
                    return unescape(tokens[1]);
                }
            }
        }

        return null;
    };

	
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
			
			this.pages = [{'key': 'home', 'element': container, 'panel': null}];
			
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
			
			var elBd = Dom.get('bd');
			
			E.on(elBd, "click", function (evt) {
				var el = E.getTarget(evt);
				
				elGoApp = findA(el);
				if (!L.isNull(elGoApp)){ 
					var href = elGoApp.getAttribute('href');
					var newApp = getBookmarkedParameter("app", href);
					
					if (newApp){ // идентификатор приложения не пустой => выполняем его
						E.preventDefault(evt);
						
						var currApp = H.getCurrentState("app", href);
						if (newApp != currApp){
							H.navigate("app", newApp);
						}
						return;
					}
				}

				var ps = __self.pages;
				// проверить клик в панелях
				for (var i in ps){
					var panel = ps[i]['panel'];
					if (!L.isNull(panel) && panel.onClick(el)){
						E.preventDefault(evt);
						return;
					}
				}
				
			});
			
            E.on(window, "resize", function(event){
            	__self._setWorkspaceSize();
            });
            this._setWorkspaceSize();
		},
		
		_setWorkspaceSize: function(key){
			var r = Dom.getClientRegion();
			
			var el = Dom.get('bos'),
				w = Math.max(Math.min(r.width, 1024), 640);
            Dom.setStyle(el, "width", (w)+'px');
            
			var ps = this.pages;
			for (var i in ps){
				var panel = ps[i]['panel'];
				if (!L.isNull(panel) && L.isFunction(panel.onResize)){
					var rg = new YAHOO.util.Region(0, w, 0, 0);
					
					if ((key && key == ps[i]['key']) || !key){
			            Dom.setStyle(ps[i]['element'], "width", (w)+'px');
						panel.onResize(rg);
					}
				}
			}
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
			if (bookmarkedSection != "home"){
				this.navigate(bookmarkedSection);
			}
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
			
			this.declaredKey = key;
			
			var fire = function(){
				
				wait.close();
				
				var fn = Brick.mod[mod]['API'][page];
				if (!L.isFunction(fn)){ return; }
				
				fn(prm1, prm2, prm3, prm4, prm5);
			};
			
			if (!Brick.componentLoaded(mod, comp)){
				Brick.Component.API.fireFunction(mod, comp, function(){
					fire();
				});
			}else{
				fire();
			}
		},
		
		registerPage: function(panel){
			var key = this.declaredKey,
				div = document.createElement('div');
			div.innerHTML = this._TM.replace('page', {
				'id': key.replace(/\//g, '-')
			});
			var elPage = div.childNodes[0];
			Dom.get('pages').appendChild(elPage);
			this.declaredKey = null;

			this.addPage(key, elPage, panel);
			return {'elPage': elPage, 'key': key};
		},
		
		addPage: function(key, element, panel){
			if (this.pageExist(key)){ return; }
			var ps = this.pages;
			ps[ps.length] = {'key': key, 'element': element, 'panel': panel};
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

			Dom.setStyle(ePS, 'width', (w*2+40)+'px');
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
			this._setWorkspaceSize(key);
			
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
		}
	};
	NS.Workspace = Workspace;
	
	API.buildWorkspace = function(){
		Brick.Permission.load(function(){
			new NS.Workspace();
		});
	};

};