/*
@version $Id$
@copyright Copyright (C) 2011 Abricos All rights reserved.
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
	     {name: 'user', files: ['permission.js']},
	     {name: 'uprofile', files: ['lib.js']}
	]
};
Component.entryPoint = function(NS){
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		H = YAHOO.util.History;

	var _isGlobalRunStatus = false;
	
	var buildTemplate = this.buildTemplate;
	
	NS.logout = function(){
		Brick.f('user', 'api', 'userLogout', function(){
			Brick.Page.reload();
		});
	};
	var _globalPageIdInc = 1;

	var BrickPanel = Brick.widget.Panel;
	var Panel = function(config){
		config = config || {};
		
		if (config.modal){
			alert('Use Brick.widget.Dialog for modal panel in BosUI');
	        return;
		}
		
		this.init(config);
	};
	Panel.prototype = {
		init: function(config){
			
			this.id = 'bospage' + _globalPageIdInc++;
			
			var container = Workspace.instance.registerPage(this);
			
			container.innerHTML = (config.template || this.initTemplate());
			this._wPageContainer = container;
			this._isDestroy = false;
			
			var res = Dom.getElementsByClassName('bd', 'div', container);
			if (res && res.length >= 1){
				this.body = res[0];
			}
			
			var header = Dom.getElementsByClassName('hd', 'div', container);
			if (header && res.length >= 1){
				this.header = header[0];
			}			

			this.onLoad();
		},
		onLoad: function(){},
		onShow: function(){},
		destroy: function(){
			this._isDestroy = true;
		},
		isDestroy: function(){ return this._isDestroy; },
		onClick: function(el){ return false; },
		onResize: function(rel){},
		close: function(){
			this.destroy();
			this._isDestroy = true;
			
			var elPage = this._wPageContainer;
			elPage.parentNode.removeChild(elPage);
			
			Workspace.instance.closePageMethod(this);
		}
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
	
	NS.wait = function(){
		
		var waitPanel = null;
		
		return {
			show: function(){
				waitPanel = new WaitPanel();
			},
			hide: function(){
				if (L.isNull(waitPanel)){ return; }
				waitPanel.close();
				waitPanel = null;
			}
		};
	}();

	
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
		 * Путь к надписи в виде массива в менеджере фраз. Например: ['mod', 'user', 'app', 'title']
		 * @property titleId
		 * @type String
		 * @default ['mod', <i>moduleName</i>, 'app', 'title']
		 */
		this.titlePath = ['mod', moduleName, 'app', 'title'];
		
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
		 * Функция автозагрузки до построения интерфейса
		 * @property startup
		 * @type Function
		 */
		this.startup = null;
		
		/**
		 * Функция автозагрузки после построения интерфейса
		 * @property startupAfter
		 * @type Function
		 */
		this.startupAfter = null;
		
		/**
		 * Получить надпись.
		 * 
		 * @method getTitle
		 * @return {String}  
		 */
		this.getTitle = function(){
			var phrase = Brick.util.Language.geta(this.titlePath);
			if (L.isString(phrase)){
				return phrase;
			}
			
			phrase = Brick.util.Language.getc(this.titleId);
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
			
			if (!L.isNull(Workspace.instance) && Workspace.instance.firstRender){
				Workspace.instance.renderApp(app);
			}
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
		
		// Автозагрузка
		var startup = [];
		
		this.startupRegister = function(func){
			if (!L.isFunction(func)){ return; }
			startup[startup.length] = func;
		};
		
		this.startupEach = function(func){
			for (var i=0;i<startup.length;i++){
				func(startup[i]);
			}
		};

		// Автозагрузка
		var startupAfter = [];
		
		this.startupAfterRegister = function(func){
			if (!L.isFunction(func)){ return; }
			startupAfter[startupAfter.length] = func;
		};
		
		this.startupAfterEach = function(func){
			for (var i=0;i<startupAfter.length;i++){
				func(startupAfter[i]);
			}
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

    var ActivePanelWidget = function(container, owner){
    	this.init(container, owner);
    };
    ActivePanelWidget.prototype = {
    	init: function(container, owner){
    		this.owner = owner;
    		buildTemplate(this, 'activepanel');
    		var TM = this._TM;
    		container.innerHTML = TM.replace('activepanel');
    		
    		var elSelect = TM.getEl('activepanel.table');
    		
			E.on(elSelect, "change", function (evt) {
				var page = owner.getPageByPanel(elSelect.value);
				if (!L.isNull(page) && page.panel && page.panel._bosOpenedKey){
					Brick.Page.reload("#app="+page.panel._bosOpenedKey);
				}else{
					owner.showPage(elSelect.value);
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
    			this.owner.closePage(TM.getEl('activepanel.table').value);
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
			var cntp = this.owner.pages.length;
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
	
	var Workspace = function(){
		this.init();
	};
	Workspace.instance = null;
	Workspace.prototype = {
		
		init: function(){
			Workspace.instance = this;
			
			this.selectedPage = null;
			
			this.elementLabelList = null;
			
			buildTemplate(this, 'page,labellist,label');
			
			this.activePanelWidget = new ActivePanelWidget(Dom.get('activepanel'), this);
			
			this.pages = [];
			
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
				
				var href = "";
				elGoApp = findA(el);
				if (!L.isNull(elGoApp)){ 
					href = elGoApp.getAttribute('href');
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
				
				if (href == "#"){
					E.preventDefault(evt);
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
		
		onClickActivePanel: function(el){
			if (L.isNull(this.selectedPage)){ return false; }
			
			if (el.id == 'bcloseactivepanel'){
				return true;
			}
			return false;
		},
		
		
		renderApp: function(app){
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
		
		render: function(){
			this.firstRender = true;
			
			var __self = this, TM = this._TM;
			
			NS.ApplicationManager.startupEach(function(f){
				f();
			});
			
			Dom.get('bosmenu').innerHTML = TM.replace('labellist', {'list': ""});
			
			NS.ApplicationManager.each(function(app){
				__self.renderApp(app);
			});
			
			this.elementLabelList = TM.getEl('labellist.id');

			var __self = this;
			var bookmarkedSection = H.getBookmarkedState("app") || "home";
			H.register("app", bookmarkedSection, function (key) {
				__self.navigate(key);
			});
			YAHOO.util.History.initialize("yui-history-field", "yui-history-iframe");
			if (bookmarkedSection != "home"){
				this.navigate(bookmarkedSection);
			}else{
	            this.navigate('bos/home/showHomePanel');
			}
			
			NS.ApplicationManager.startupAfterEach(function(f){
				f();
			});
		},
		
		navigate: function(key){
			var arr = key.split('/'),
				mod = arr[0],
				comp = arr[1] || '',
				page = arr[2] || '',
				prm1 = arr[3] || '', prm2=arr[4]||'', prm3=arr[5]||'', prm4=arr[6]||'', prm5=arr[7]||'';
			
			var am = decodeURIComponent(mod).split("\t");
			if (am.length == 3){
				mod = am[0];
				if (am[1]*1 != 80){
					mod += ":"+am[1];
				}
				mod += "/"+am[2];
			}
			
			if (!Brick.componentExists(mod, comp)){
				return; 
			}
			
			var __self = this;
			
			NS.wait.show();
			var fire = function(){
				_isGlobalRunStatus = true;
				NS.wait.hide();
				var fn = Brick.mod[mod]['API'][page];
				if (!L.isFunction(fn)){ return; }
				
				var panel = fn(prm1, prm2, prm3, prm4, prm5);
				if (panel && !L.isNull(panel) && panel.id != ""){
					panel._bosOpenedKey = key;
					__self.showPage(panel);
				}
				_isGlobalRunStatus = false;
			};
			
			if (!Brick.componentLoaded(mod, comp)){
				Brick.Component.API.fireFunction(mod, comp, function(){
					fire();
				});
			}else{
				fire();
			}
		},
		
		// создать страницу контейнер в bosui и отдать его панели для отображения
		registerPage: function(panel){
			var div = document.createElement('div');
			
			div.innerHTML = this._TM.replace('page', {
				'id': panel.id
			});
			var elPage = div.childNodes[0];
			Dom.get('pages').appendChild(elPage);

			var ps = this.pages;
			ps[ps.length] = {'element': elPage, 'panel': panel};
			
			return elPage;
		},
		
		getPage: function(id){
			var ps = this.pages;
			for (var i=0;i<ps.length;i++){
				if (ps[i]['panel'].id == id){
					return ps[i];
				}
			}
			return null;
		},
		
		closePage: function(panel){
			var page = this.getPageByPanel(panel);
			if (L.isNull(page)){ return; }
			page.panel.close();
		},
		
		closePageMethod: function(panel){
			var page = this.getPageByPanel(panel);
			if (L.isNull(page)){ return; }
			var ps = this.pages, 
				nps = [];
			for (var i=0;i<ps.length;i++){
				if (ps[i].panel.id != page.panel.id){
					nps[nps.length] = ps[i];
				}
			}
			this.pages = nps;
			this.selectedPage = null;
			this.activePanelWidget.removePage(page);
			
			if (nps.length > 0){
				var lastPanel = nps[nps.length-1].panel;
				if (lastPanel._bosOpenedKey && !_isGlobalRunStatus){
					Brick.Page.reload("#app="+lastPanel._bosOpenedKey);
				}
			}
		},
		
		getPageByPanel: function(panel){
			if (L.isString(panel)){
				var page = this.getPage(panel);
				if (!L.isNull(page)){
					panel = page['panel'];
				}else{ return null; }
			}
			
			if (!panel || L.isNull(panel) || !panel.id){ return null; }
			
			return this.getPage(panel.id);
		},

		showPage: function(panel){
			var page = this.getPageByPanel(panel);
			if (L.isNull(page)){ return; }
			
			if (this.selectedPage == page){ return; }
			
			var curPage = this.selectedPage;
			
			var ps = this.pages;
			for (var i=0;i<ps.length;i++){
				Dom.setStyle(ps[i]['element'], 'display', 'none');
			}
			Dom.setStyle(page['element'], 'display', '');
			
			this.selectedPage = page;
			page.panel.onShow();
			
			this.activePanelWidget.setPage(page);
			
			return;
			
			/*

			
			if (this.selectedKey == key){ return; }
			
			this.prevDeclareKey = this.selectedKey;

			// reindex pages
			var ps = this.pages;
			for (var i=0; i<ps.length;i++){
				ps[i]['index'] = i;
			}

			var eBD = Dom.get('bd'),
				ePS = Dom.get('pages'),
				rg = Dom.getRegion(eBD),
				p1 = this.getPage(this.selectedKey),
				p2 = this.getPage(key);

			this.selectedKey = key;
			this._setWorkspaceSize(key);

			if (L.isNull(p1)){ // панель была закрыта по close 
				Dom.setStyle(p2.element, 'display', '');
				return;
			}
			
			var i1 = p1.index, e1 = p1.element,
				i2 = p2.index, e2 = p2.element;


			var moveEffect = false;
			
			if (!moveEffect){
				
				Dom.setStyle(e1, 'display', 'none');
				Dom.setStyle(e2, 'display', '');
				
			}else{

				// эффект перелистывания
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
				
				var stop = function(){
					Dom.setStyle(e1, 'display', 'none');
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
								
			}
		/**/
		}
	};
	NS.Workspace = Workspace;
	
	NS.API.buildWorkspace = function(){
		Brick.Permission.load(function(){
			new NS.Workspace();
		});
	};
	
	var _sysAJAX = Brick.ajax;
	
	Brick.ajax = function(modname, cfg){
		_sysAJAX('bos', {
			'data': {
				'nm': modname,
				'd': cfg['data']
			},
			'event': function(request){
				var rd = request.data;
				if (L.isNull(rd)){ return; } // ошибка сервера

				request.data = rd.r;

				if (rd.u*1 != Brick.env.user.id*1){ // пользователь разлогинился
					Brick.Page.reload();
					return false;
				}
				
				if (L.isFunction(cfg['event'])){
					cfg['event'](request);
				}
			}
		});
	};
	
};