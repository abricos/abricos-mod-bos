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
    yui: ['history'],
    mod: [
        {name: 'bos', files: ['lib.js']},
        {name: 'uprofile', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        L = Y.Lang;

    var Dom = YAHOO.util.Dom,
        E = YAHOO.util.Event;

    // IF IE disable dynamic CSS
    if (Y.UA.ie > 0){
        Brick.util.CSS.disableCSSComponent = true;
    }

    var buildTemplate = this.buildTemplate;

    var _isGlobalRunStatus = false;

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

            var container = NS.Workspace.instance.registerPage(this);

            var tpl = (config.template || this.initTemplate());

            container.innerHTML = tpl;

            this.cfg = new YAHOO.util.Config(this);
            if (config){
                this.cfg.applyConfig(config, true);
            }

            this._wPageContainer = container;
            this._isDestroy = false;

            var res = Dom.getElementsByClassName('bd', 'div', container);
            if (res && res.length >= 1){
                this.body = res[0];
                Dom.removeClass(this.body, 'bd');
            }

            var header = Dom.getElementsByClassName('hd', 'div', container);
            if (header && res.length >= 1){
                this.header = header[0];
                Dom.removeClass(this.header, 'hd');
                Dom.setStyle(this.header, 'display', 'none');
            }

            this.onLoad();
        },
        onLoad: function(){
        },
        onShow: function(){
        },
        destroy: function(){
            this._isDestroy = true;
        },
        isDestroy: function(){
            return this._isDestroy;
        },
        onClick: function(el){
            return false;
        },
        onResize: function(rel){
        },
        close: function(){
            this.destroy();
            this._isDestroy = true;

            var elPage = this._wPageContainer;
            elPage.parentNode.removeChild(elPage);

            NS.Workspace.instance.closePageMethod(this);
        }
    };
    NS.Panel = Panel;
    Brick.widget.Panel = Panel;

    var findA = function(el, cnt){
        cnt = cnt || 1;
        if (!el || L.isNull(el) || el.parentNode == document.body || cnt > 30){
            return null;
        }
        if (el.tagName == 'A'){
            return el;
        }
        return findA(el.parentNode, cnt + 1);
    };

    var getBookmarkedParameter = function(paramName, url){
        var i, len, idx, queryString, params, tokens;

        url = url || top.location.href;
        idx = url.indexOf("#");
        queryString = idx >= 0 ? url.substr(idx + 1) : url;

        idx = url.indexOf("?");
        queryString = idx >= 0 ? queryString.substr(idx) : queryString;

        params = queryString.split("&");

        for (i = 0, len = params.length; i < len; i++){
            tokens = params[i].split("=");
            if (tokens.length >= 2){
                if (tokens[0] === paramName){
                    return unescape(tokens[1]);
                }
            }
        }

        return null;
    };

    var PageManagerWidget = function(container, defpage){
        PageManagerWidget.instance = this;
        this.init(container, defpage);
    };
    PageManagerWidget.instance = null;
    PageManagerWidget.prototype = {
        init: function(container, defpage){

            this.container = container;
            this.defpage = defpage || 'bos/home/showHomePanel';

            container.innerHTML = "";

            Workspace.instance = this;

            this.selectedPage = null;

            buildTemplate(this, 'page');

            this.pages = [];

            var history = new Y.HistoryHash();

            E.on(container, "click", function(evt){
                var el = E.getTarget(evt);

                var href = "";
                elGoApp = findA(el);
                if (!L.isNull(elGoApp)){
                    href = elGoApp.getAttribute('href');
                    var newApp = getBookmarkedParameter("app", href);

                    if (newApp){ // идентификатор приложения не пустой => выполняем его
                        E.preventDefault(evt);

                        var currApp = history.get('app');
                        if (newApp != currApp){
                            history.addValue("app", newApp);
                        }
                        return;
                    }
                }

                if (href == "#"){
                    E.preventDefault(evt);
                }
            });

            var __self = this;

            var bkm = history.get('app') || "home";

            history.on('change', function(e){
                var changed = e.changed;
                if (changed['app']){
                    var newVal = changed['app'].newVal;
                    __self.navigate(newVal);
                }
            });
            this.navigate(bkm != "home" ? bkm : this.defpage);
        },

        destroy: function(){
            var ps = this.pages;
            for (var i = 0; i < ps.length; i++){
                ps[i]['panel'].close();
            }
        },

        navigate: function(key){
            var arr = key.split('/'),
                mod = arr[0],
                comp = arr[1] || '',
                page = arr[2] || '',
                prm1 = arr[3] || '', prm2 = arr[4] || '', prm3 = arr[5] || '',
                prm4 = arr[6] || '', prm5 = arr[7] || '', prm6 = arr[8] || '', prm7 = arr[9] || '',
                prm8 = arr[10] || '', prm9 = arr[11] || '';

            var wsPage = {};
            if (arr[3]){
                wsPage.component = arr[3];
            }
            if (arr[4]){
                wsPage.widget = arr[4];
            }
            for (var i = 5; i < arr.length; i++){
                if (!wsPage.args){
                    wsPage.args = [];
                }
                wsPage.args[wsPage.args.length] = arr[i];
            }

            var am = decodeURIComponent(mod).split("\t");
            if (am.length == 3){
                mod = am[0];
                if (am[1] * 1 != 80){
                    mod += ":" + am[1];
                }
                mod += "/" + am[2];
            }

            if (!Brick.componentExists(mod, comp)){
                return;
            }

            var __self = this;

            NS.wait.show();
            var fire = function(){
                _isGlobalRunStatus = true;
                NS.wait.hide();
                var fn = Brick.mod[mod][page];
                if (L.isFunction(fn)){

                    var panel = {
                        id: Y.guid()
                    };

                    fn({
                        //boundingBox: container,
                        getBoundingBox: function(){
                            return __self.registerPage(panel);
                        },
                        workspacePage: wsPage
                    }, function(err, widget){
                        if (!widget.id){
                            widget.id = panel.id;
                        }
                        __self.showPage(widget);

                        _isGlobalRunStatus = false;
                    });
                } else if (L.isFunction(fn = Brick.mod[mod]['API'][page])){
                    var panel = fn(prm1, prm2, prm3, prm4, prm5, prm6, prm7, prm8, prm9);
                    if (panel && !L.isNull(panel) && panel.id != ""){
                        panel._bosOpenedKey = key;
                        __self.showPage(panel);
                    }
                    _isGlobalRunStatus = false;
                }
            };

            if (!Brick.componentLoaded(mod, comp)){
                Brick.Component.API.fireFunction(mod, comp, function(){
                    fire();
                });
            } else {
                fire();
            }
        },

        showPage: function(panel){
            var page = this.getPageByPanel(panel);
            if (L.isNull(page)){
                return;
            }

            if (this.selectedPage == page){
                return;
            }

            var ps = this.pages;
            for (var i = 0; i < ps.length; i++){
                Y.one(ps[i]['element']).addClass('hide');
            }
            Y.one(page['element']).removeClass('hide');

            this.selectedPage = page;
            if (page.panel && page.panel.onShow){
                page.panel.onShow();
            }
        },

        // создать страницу контейнер в bosui и отдать его панели для отображения
        registerPage: function(panel){
            var div = document.createElement('div');

            div.innerHTML = this._TM.replace('page', {
                'id': panel.id
            });
            var elPage = div.childNodes[0];

            this.container.appendChild(elPage);

            var ps = this.pages;
            ps[ps.length] = {'element': elPage, 'panel': panel};

            return elPage;
        },

        getPage: function(id){
            var ps = this.pages;
            for (var i = 0; i < ps.length; i++){
                if (ps[i]['panel'].id == id){
                    return ps[i];
                }
            }
            return null;
        },

        closePage: function(panel){
            var page = this.getPageByPanel(panel);
            if (L.isNull(page)){
                return;
            }
            page.panel.close();
        },

        closePageMethod: function(panel){
            var page = this.getPageByPanel(panel);
            if (L.isNull(page)){
                return;
            }
            var ps = this.pages,
                nps = [];
            for (var i = 0; i < ps.length; i++){
                if (ps[i].panel.id != page.panel.id){
                    nps[nps.length] = ps[i];
                }
            }
            this.pages = nps;
            this.selectedPage = null;

            if (nps.length > 0){
                var lastPanel = nps[nps.length - 1].panel;
                if (lastPanel._bosOpenedKey && !_isGlobalRunStatus){
                    Brick.Page.reload("#app=" + lastPanel._bosOpenedKey);
                }
            }
        },

        getPageByPanel: function(panel){
            if (L.isString(panel)){
                var page = this.getPage(panel);
                if (!L.isNull(page)){
                    panel = page['panel'];
                } else {
                    return null;
                }
            }

            if (!panel || L.isNull(panel) || !panel.id){
                return null;
            }

            return this.getPage(panel.id);
        }

    };
    NS.PageManagerWidget = PageManagerWidget;


    var Workspace = function(){
        this.init();
    };
    Workspace.instance = null;
    Workspace.prototype = {
        init: function(){
            this.pageManagerWidget = new NS.PageManagerWidget(Dom.get('bos-pages'));
        }
    };
    NS.Workspace = Workspace;

    NS.API.buildWorkspace = function(cfg){
        new NS.Workspace(cfg);
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
                if (L.isNull(rd)){
                    return;
                } // ошибка сервера

                request.data = rd.r;

                if (rd.u * 1 != Brick.env.user.id * 1){ // пользователь разлогинился
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