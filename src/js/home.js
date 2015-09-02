var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['container.js']}
    ]
};
Component.entryPoint = function(NS){

    var Dom = YAHOO.util.Dom,
        E = YAHOO.util.Event,
        L = YAHOO.lang;

    var buildTemplate = this.buildTemplate;

    var HomeItemWidget = function(container, Widget, rs, numcol){
        this.init(container, Widget, rs, numcol);
    };
    HomeItemWidget.prototype = {
        init: function(container, Widget, rs, numcol){

            this.numcol = numcol;

            var TM = buildTemplate(this, 'item');

            var div = document.createElement('div');
            div.innerHTML = TM.replace('item');

            container.appendChild(div.childNodes[0]);
            this.widget = new Widget(TM.getEl('item.widget'), rs);
        },
        getRegion: function(){
            var el = this._TM.getEl('item.id');
            return Dom.getRegion(el);
        }
    };
    NS.HomeItemWidget = HomeItemWidget;

    var HomePanel = function(){
        HomePanel.superclass.constructor.call(this, {
            fixedcenter: true, width: '790px', height: '400px'
        });
    };
    YAHOO.extend(HomePanel, Brick.widget.Panel, {
        initTemplate: function(){
            return buildTemplate(this, 'panel').replace('panel');
        },
        onLoad: function(){

            this.ws = [];
            var list = [], mods = [];
            // сформировать список модулей имеющих компонент bosonline в наличие
            for (var m in Brick.Modules){
                if (Brick.componentExists(m, 'bosonline') && !Brick.componentLoaded(m, 'bosonline')){
                    list[list.length] = {name: m, files: ['bosonline.js']};
                    mods[mods.length] = m;
                }
            }

            var __self = this;
            var startLoad = function(){
                Brick.ajax('bos', {
                    'data': {
                        'do': 'online',
                        'mods': mods
                    },
                    'event': function(request){
                        __self.onLoadData(request.data);
                    }
                });
            };

            if (list.length > 0){
                Brick.Loader.add({
                    mod: list,
                    onSuccess: function(){
                        startLoad();
                    }
                });
            } else {
                startLoad();
            }
        },
        onLoadData: function(d){

            var TM = this._TM;

            var el = TM.getEl('panel.prc');
            if (!L.isNull(el)){
                el.parentNode.removeChild(el);
            }

            var showUProfile = function(){
                if (Brick.env.user.id > 0 && Brick.componentExists('uprofile', 'lib')){
                    Brick.Page.reload('#app=uprofile/ws/showws/');
                }
            };

            if (L.isNull(d) || (L.isArray(d) && d.length == 0)){
                showUProfile();
            } else {
                for (var i = 0; i < d.length; i++){
                    this.renderWidget(d[i]);
                }
                if (this.ws.length == 0){
                    showUProfile();
                }
            }
        },
        renderWidget: function(di){
            var W = NS.onlineManager.get(di['n']);
            if (!W){
                return;
            }

            var rs = di['d'];

            if (L.isFunction(W['isEmptyRecords'])){
                if (W['isEmptyRecords'](rs)){
                    return;
                }
            } else {
                if (!L.isArray(rs) || rs.length == 0){
                    return;
                }
            }

            var TM = this._TM, ws = this.ws;
            Dom.setStyle(TM.getEl('panel.loading'), 'display', 'none');

            var h1 = 0, h2 = 0;

            for (var i = 0; i < ws.length; i++){
                var w = ws[i], rg = w.getRegion();
                if (w.numcol == 1){
                    h1 += rg.height;
                } else {
                    h2 += rg.height;
                }
            }

            var numcol = h1 <= h2 ? 1 : 2;
            var elc = TM.getEl('panel.col' + numcol);

            ws[ws.length] =
                new HomeItemWidget(elc, W, di['d'], numcol);
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