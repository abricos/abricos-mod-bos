var Component = new Brick.Component();
Component.requires = {
    yui: ['history'],
    mod: [
        {name: 'sys', files: ['item.js']}, // TODO: remove, use over request in old apps
        {name: 'bos', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    // TODO: CHECK - IF IE disable dynamic CSS
    if (Y.UA.ie > 0){
        Brick.util.CSS.disableCSSComponent = true;
    }

    NS.WorkspaceMenuWidget = Y.Base.create('workspaceMenuWidget', SYS.AppWidget, [], {
        execMethod: function(module, component, method){
            this.set('waiting', true);
            Brick.use(module, component, function(err, ns){
                this.set('waiting', true);
                if (err){
                    return;
                }
                if (Y.Lang.isFunction(ns[method])){
                    ns[method]();
                }
            }, this);
        },
        onClick: function(e){
            if (Y.Lang.isString(e.dataClick) && e.dataClick.length > 0){
                var module = e.target.getData('module'),
                    component = e.target.getData('component');
                this.execMethod(module, component, e.dataClick);
                return true;
            }
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            useExistingWidget: {value: true}
        }
    });

    NS.WorkspaceWidget = Y.Base.create('workspaceWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            NS.WorkspaceWidget.instance = this;

            var menuNode = this.get('srcMenuNode');
            if (menuNode){
                this.menuWidget = new NS.WorkspaceMenuWidget({
                    srcNode: menuNode
                });
            }

            this._pages = [];

            this._history = new Y.HistoryHash();
            this._history.on('change', this._onHistoryChange, this);

            this.navigate(this._history.get('app'), function(){
                this.execExtensions();
            }, this);
        },
        destructor: function(){
            if (this.menuWidget){
                this.menuWidget.destructor();
            }
            this._history.detach(this._onHistoryChange);

            var ps = this._pages;
            for (var i = 0; i < ps.length; i++){
                if (ps[i].widget){
                    ps[i].widget.destroy();
                }
            }
        },
        _execExtension: function(exts, callback, context){
            if (exts.length === 0){
                return callback.call(context, null);
            }
            var ext = exts.pop();

            Brick.use(ext.module, ext.component, function(err, ns){
                if (Y.Lang.isFunction(ns[ext.method])){
                    ns[ext.method].call(null, {workspaceWidget: this}, function(){
                        this._execExtension(exts, callback, context);
                    }, this);
                }else{
                    this._execExtension(exts, callback, context);
                }
            }, this);
        },
        execExtensions: function(callback, context){
            callback = Y.Lang.isFunction(callback) ? callback : function(){
            };
            context = context || this;

            var exts = this.get('extensions').slice();
            this._execExtension(exts, callback, context);
        },
        _onHistoryChange: function(e){
            if (e.changed['app']){
                this.navigate(e.changed['app'].newVal);
            }
        },
        _parseURL: function(key){
            var a = key.split('/'),
                ret = {
                    module: a[0] || '',
                    component: a[1] || '',
                    startPoint: a[2] || '',
                    workspacePage: {
                        component: a[3] || '',
                        widget: a[4] || '',
                        args: []
                    }
                },
                args = ret.workspacePage.args;

            for (var i = 5; i < a.length; i++){
                args[args.length] = a[i];
            }
            ret.id = ret.module + ':' + ret.component + ':' + ret.startPoint;

            return ret;
        },
        createPage: function(key){
            var pURL = this._parseURL(key),
                tp = this.template,
                id = Y.guid(),
                node = tp.append('pages', tp.replace('page', {id: id}));

            var page = {
                id: pURL.id,
                node: node,
                widgetNode: Y.Node.one('#' + id)
            };
            this._pages[this._pages.length] = page;
            return page;
        },
        getPage: function(key){
            var pURL = this._parseURL(key),
                ps = this._pages;
            for (var i = 0; i < ps.length; i++){
                if (pURL.id === ps[i].id){
                    return ps[i];
                }
            }
            return null;
        },
        showPage: function(key){
            var page = this.getPage(key);

            if (!page){
                return; // OPS... What is it?
            }
            if (this._selectedPage === page){
                return;
            }
            var ps = this._pages;
            for (var i = 0; i < ps.length; i++){
                if (page.id === ps[i].id){
                    ps[i].node.removeClass('hide');
                } else {
                    ps[i].node.addClass('hide');
                }
            }
            this._selectedPage = page;
        },
        navigate: function(key, callback, context){
            callback = Y.Lang.isFunction(callback) ? callback : function(){
            };
            context = context || this;

            if (!key){
                key = this.get('defaultPage');
            }
            var pURL = this._parseURL(key),
                pageInfo = this.getPage(key);

            if (pageInfo){
                this.showPage(key);
                pageInfo.widget.showWorkspacePage(pURL.workspacePage);
                callback.call(context, null, pageInfo);
                return;
            }

            if (!Brick.componentExists(pURL.module, pURL.component)){
                callback.call(context, {
                    err: 404,
                    msg: 'Component not found: module=`' + pURL.module
                    + '`, component=`' + pURL.component + '`'
                }, null);
                return; // TODO: show 404 page
            }

            Brick.use(pURL.module, pURL.component, function(err, ns){
                if (err || !Y.Lang.isFunction(ns[pURL.startPoint])){
                    callback.call(context, {
                        err: 500,
                        msg: 'StartPoint not found: module=`' + pURL.module
                        + '`, component=`' + pURL.component
                        + '`, startPoint=`' + pURL.startPoint + '`'
                    }, null);
                    return;// TODO: show 404 page
                }
                pageInfo = this.createPage(key);
                pageInfo.widget = ns[pURL.startPoint]({
                    boundingBox: pageInfo.widgetNode,
                    workspacePage: pURL.workspacePage
                });
                this.showPage(key);
                callback.call(context, null, pageInfo);
            }, this);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,page'},
            srcMenuNode: {
                getter: Y.Node.one
            },
            defaultPage: {
                value: 'bos/wspace/ws'
            },
            extensions: {value: []}
        }
    });

};