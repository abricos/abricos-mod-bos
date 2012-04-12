/*
@version $Id$
@copyright Copyright (C) 2012 Abricos All rights reserved.
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
	     {name: 'user', files: ['permission.js']},
	     {name: 'sys', files: ['container.js']}
	]
};
Component.entryPoint = function(NS){
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang,
		H = YAHOO.util.History;

	var buildTemplate = this.buildTemplate;

	var WaitPanel = function(){
		WaitPanel.superclass.constructor.call(this, {width: '350px'});
	};
	YAHOO.extend(WaitPanel, Brick.widget.Dialog, {
		initTemplate: function(){
			return buildTemplate(this, 'waitpanel').replace('waitpanel');
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

	NS.logout = function(){
		Brick.f('user', 'api', 'userLogout', function(){
			Brick.Page.reload();
		});
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
			
			//!!!
			/*
			if (!L.isNull(Workspace.instance) && Workspace.instance.firstRender){
				Workspace.instance.renderApp(app);
			}
			/**/
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

	var OnlineWidget = function(container, rs){
		this.init(container, rs);
	};
	OnlineWidget.prototype = {
		init: function(container, rs){},
		destroy: function(){}
	};
	NS.OnlineWidget = OnlineWidget;
	
	
	var OnlineManager = function(){
		this.init();
	};
	OnlineManager.prototype = {
		init: function(){
			this.ws = {};
		},
		register: function(modName, widget){
			this.ws[modName] = widget;
		},
		get: function(modName){
			return this.ws[modName];
		}
	};
	NS.OnlineManager = OnlineManager;
	NS.onlineManager = new OnlineManager();
	
};