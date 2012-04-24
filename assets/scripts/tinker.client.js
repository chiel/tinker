(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {
                exports: {}
            };
            var exports = module.exports;
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    require("0");
})({
    "0": function(require, module, exports, global) {
        "use strict";
        log("client.js");
        var events = require("1");
        require("2");
        require("3");
        window.Tinker = {
            init: function() {
                events.publish("init");
            }
        };
    },
    "1": function(require, module, exports, global) {
        "use strict";
        log("events.js");
        var events = new Events;
        function publish(type, args, delay) {
            events.fireEvent(type, args, delay);
        }
        function subscribe(type, fn, internal) {
            events.addEvent(type, fn, internal);
        }
        module.exports = {
            publish: publish,
            subscribe: subscribe
        };
    },
    "2": function(require, module, exports, global) {
        "use strict";
        log("tinker.js");
        var events = require("1");
        var layout = require("3");
        var data = JSON.parse(document.getElement("script[type=tinker]").get("html"));
        var tinker = {
            hash: data.hash || null,
            revision: data.revision || null,
            revision_id: data.revision_id || 0,
            x_user_id: data.x_user_id || null,
            username: data.username || null,
            doctype: data.doctype || null,
            framework: data.framework || null,
            extensions: data.extensions || [],
            normalize: data.normalize || null,
            assets: data.assets || [],
            title: data.title || null,
            description: data.description || null,
            markup: data.markup || null,
            style: data.style || null,
            interaction: data.interaction || null
        };
        if (tinker.username) {
            var url = "/" + tinker.username + "/" + tinker.hash;
            if (tinker.revision) {
                url += "/" + tinker.revision;
            }
            if (!!(window.history && history.pushState)) {
                history.pushState(null, null, url);
            } else {
                window.location = url;
            }
        }
        var inputHash, inputRevision, inputRevisionId, saveButton;
        var build = function() {
            log("tinker.build();");
            var saveLabel = tinker.username ? "Fork" : "Save", buttons;
            var html = '<li><a href="#run" class="button run">Run</a></li>' + '<li><a href="#save" class="button primary save">' + saveLabel + "</a></li>";
            layout.addToRegion(buttons = new Element("ul.buttons", {
                html: html,
                events: {
                    click: function(e) {
                        e.preventDefault();
                        var href = e.target.get("href");
                        if (href === "#run") {
                            run();
                        } else if (href === "#save") {
                            save();
                        }
                    }
                }
            }), "tr");
            saveButton = buttons.getElement(".save");
            layout.wrapper.adopt(inputHash = new Element("input[type=hidden]", {
                name: "hash",
                value: tinker.hash
            }), inputRevision = new Element("input[type=hidden]", {
                name: "revision",
                value: tinker.revision
            }), inputRevisionId = new Element("input[type=hidden]", {
                name: "revision_id",
                value: tinker.revision_id
            }));
        };
        var run = function() {
            events.publish("tinker.save");
            layout.wrapper.submit();
        };
        var save = function() {
            events.publish("tinker.save");
            layout.wrapper.submit();
            (new Request.JSON({
                url: "/save",
                data: layout.wrapper,
                method: "post",
                onSuccess: function(response) {
                    if (response.status === "ok") {
                        tinker.hash = response.hash;
                        tinker.revision = response.revision;
                        tinker.revision_id = response.revision_id;
                        inputHash.set("value", tinker.hash);
                        inputRevision.set("value", tinker.revision);
                        inputRevisionId.set("value", tinker.revision_id);
                        saveButton.set("text", "Save");
                        var url = "/" + tinker.hash;
                        url += tinker.revision > 0 ? "/" + tinker.revision : "";
                        if (!!(window.history && history.pushState)) {
                            history.pushState(null, null, url);
                        } else {
                            window.location = url;
                        }
                    } else if (response.status === "error") {
                        log(response.error.message);
                    }
                }
            })).send();
        };
        events.subscribe("layout.build", build);
        if (tinker.hash) {
            events.subscribe("result.build", run);
        }
    },
    "3": function(require, module, exports, global) {
        "use strict";
        log("layout/client.js");
        var events = require("1");
        var Panel = require("4");
        var urls = require("5");
        var storage = require("6");
        require("7");
        require("9");
        require("a");
        require("b");
        require("c");
        require("d");
        var layout = {}, layouts = [], layoutCount = 0, curLayout, wrapper, header, body, footer, regions, panels, picker, pickerArrow, pickerList, pickerButtons = [];
        layout.min = {
            x: 200,
            y: 100,
            ox: 210,
            oy: 110
        };
        var build = function(config) {
            log("layout.client.build(", config, ");");
            layout.wrapper = wrapper = (new Element("form#wrapper", {
                method: "post",
                action: urls.sandbox,
                target: "sandbox"
            })).inject(document.body);
            header = (new Element("header")).inject(wrapper);
            layout.body = body = (new Element("div#body")).inject(wrapper);
            footer = (new Element("footer")).inject(wrapper);
            regions = {
                tl: (new Element("div.region.tl")).inject(header),
                tm: (new Element("div.region.tm")).inject(header),
                tr: (new Element("div.region.tr")).inject(header),
                bl: (new Element("div.region.bl")).inject(footer),
                bm: (new Element("div.region.bm")).inject(footer),
                br: (new Element("div.region.br")).inject(footer)
            };
            layout.panels = panels = [ new Panel(body, 0), new Panel(body, 1), new Panel(body, 2), new Panel(body, 3) ];
            picker = (new Element("div#layoutpicker", {
                children: [ pickerArrow = new Element("div.arrow", {
                    morph: {
                        duration: 150
                    }
                }), pickerList = new Element("ul") ]
            })).addEvent("click", function(e) {
                e.preventDefault();
                if (e.target.get("tag") === "a") {
                    layout.activate(e.target.get("data-index"));
                }
            });
            layout.addToRegion(picker, "bm");
            var els = panels.map(function(p) {
                return p.getOuter();
            });
            layout.fx = new Fx.Elements(els, {
                duration: 200
            });
            events.publish("layout.build");
            layout.activate(storage.get("activeLayout", 0));
        };
        layout.addToRegion = function(el, region) {
            log("layout.client.addToRegion(", el, region, ");");
            if (!regions[region]) {
                return;
            }
            if (typeOf(el) !== "element") {
                return;
            }
            regions[region].adopt(el);
        };
        layout.addLayout = function(spec) {
            log("layout.client.addLayout(", spec, ");");
            if (!(spec.hasOwnProperty("activate") && typeOf(spec.activate) === "function") || !(spec.hasOwnProperty("deactivate") && typeOf(spec.deactivate) === "function")) {
                return;
            }
            var li = '<li><a href="#layout{index}" class="button-layout ls-{index}" data-index="{index}"></a></li>'.substitute({
                index: layoutCount
            });
            pickerList.innerHTML += li;
            pickerButtons.push(pickerList.getElement(".ls-" + layoutCount));
            layouts.push(spec);
            layoutCount++;
        };
        layout.activate = function(index) {
            log("layout.client.activate(", index, ");");
            if (index !== curLayout) {
                var init = curLayout === undefined;
                if (init && !layouts[index]) {
                    index = 0;
                }
                if (!init && layouts[curLayout]) {
                    pickerButtons[curLayout].removeClass("active");
                    document.html.removeClass("layout-" + curLayout);
                    layouts[curLayout].deactivate();
                }
                if (layouts[index]) {
                    var pos = pickerButtons[index].getPosition(picker), size = pickerButtons[index].getSize();
                    pickerArrow.morph({
                        left: pos.x + size.x / 2 - 5
                    });
                    pickerButtons[index].addClass("active");
                    document.html.addClass("layout-" + index);
                    localStorage.activeLayout = index;
                    layouts[index].activate(init);
                    curLayout = index;
                }
            }
        };
        layout.getPanel = function(index) {
            log("layout.client.getPanel(", index, ");");
            if (!panels[index]) {
                return false;
            }
            return panels[index];
        };
        events.subscribe("init", build);
        module.exports = layout;
    },
    "4": function(require, module, exports, global) {
        "use strict";
        log("panel.js");
        var panel = new Class({
            wrapper: null,
            outer: null,
            inner: null,
            initialize: function(wrapper, index) {
                this.wrapper = wrapper;
                this.index = index;
                this.outer = (new Element("section#panel" + index)).inject(this.wrapper);
                this.inner = (new Element("div.inner")).inject(this.outer);
            },
            getOuter: function() {
                return this.outer;
            },
            getInner: function() {
                return this.inner;
            },
            getCoords: function(outer) {
                var pos = this.inner.getPosition(this.wrapper), size = this.inner.getSize();
                return {
                    x1: pos.x,
                    y1: pos.y,
                    x2: pos.x + size.x,
                    y2: pos.y + size.y
                };
            }
        });
        module.exports = panel;
    },
    "5": function(require, module, exports, global) {
        "use strict";
        log("urls.js");
        module.exports = JSON.parse(document.getElement("script[type=urls]").get("html"));
    },
    "6": function(require, module, exports, global) {
        "use strict";
        log("layout/layouts/1.js");
        var storage = {}, cache = {};
        storage.set = function(key, value) {
            log("storage.set(", key, value, ");");
            cache[key] = value;
        };
        storage.get = function(key, defaultValue) {
            log("storage.get(", key, defaultValue, ");");
            return cache[key] || defaultValue;
        };
        storage.persist = function() {
            if (window.localStorage) {
                window.localStorage.tinker = JSON.stringify(cache);
            }
        };
        if (window.localStorage && window.localStorage.tinker) {
            cache = JSON.parse(window.localStorage.tinker);
        }
        window.addEvent("unload", storage.persist);
        module.exports = storage;
    },
    "7": function(require, module, exports, global) {
        "use strict";
        log("editor/markup.js");
        var events = require("1");
        var base = require("8");
        var layout;
        var editor = Object.merge({}, base, {
            build: function() {
                this.panel = layout.getPanel(0);
                if (!this.panel) {
                    return false;
                }
                this.frame = new Element("div.frame");
                this.textarea = new Element("textarea", {
                    name: "markup"
                });
                this.settings = new Element("div.settings", {
                    text: "HTML"
                });
                this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
                var options = Object.append({
                    mode: "text/html",
                    value: this.textarea.get("value")
                }, this.mirrorOptions);
                this.codemirror = CodeMirror(this.frame, options);
                this.textarea.addClass("is-hidden");
                this.highlightLine();
            }
        });
        events.subscribe("layout.build", function() {
            layout = require("3");
        });
        events.subscribe("layout.build", editor.init.bind(editor));
        events.subscribe("tinker.save", editor.save.bind(editor));
        events.subscribe("layout.activate", editor.refresh.bind(editor));
        events.subscribe("layout.dragEnd", editor.refresh.bind(editor));
    },
    "8": function(require, module, exports, global) {
        "use strict";
        log("editor/base.js");
        var base = {
            curLine: 0,
            mirrorOptions: {
                tabSize: 4,
                indentUnit: 4,
                indentWithTabs: true,
                lineNumbers: true,
                matchBrackets: true,
                fixedGutter: true,
                theme: "tinker-light"
            },
            panel: null,
            prepare: function() {},
            init: function() {
                var self = this;
                Object.append(this.mirrorOptions, {
                    onFocus: this.onFocus.bind(this),
                    onBlur: this.onBlur.bind(this),
                    onCursorActivity: this.highlightLine.bind(this)
                });
                this.build();
            },
            onFocus: function() {
                this.frame.addClass("focused");
                this.highlightLine();
            },
            onBlur: function() {
                this.frame.removeClass("focused");
            },
            highlightLine: function() {
                if (this.codemirror) {
                    this.codemirror.setLineClass(this.curLine, null);
                    this.curLine = this.codemirror.getCursor().line;
                    this.codemirror.setLineClass(this.curLine, "active_line");
                }
            },
            refresh: function() {
                if (this.codemirror) {
                    this.codemirror.refresh();
                }
            },
            save: function() {
                if (this.codemirror) {
                    this.textarea.set("value", this.codemirror.getValue().toBase64());
                }
            },
            getPanel: function() {
                return this.panel;
            }
        };
        module.exports = base;
    },
    "9": function(require, module, exports, global) {
        "use strict";
        log("editor/style.js");
        var events = require("1");
        var base = require("8");
        var layout;
        var editor = Object.merge({}, base, {
            build: function() {
                this.panel = layout.getPanel(1);
                if (!this.panel) {
                    return false;
                }
                this.frame = new Element("div.frame");
                this.textarea = new Element("textarea", {
                    name: "style"
                });
                this.settings = new Element("div.settings", {
                    text: "CSS"
                });
                this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
                var options = Object.append({
                    mode: "text/css",
                    value: this.textarea.get("value")
                }, this.mirrorOptions);
                this.codemirror = CodeMirror(this.frame, options);
                this.textarea.addClass("is-hidden");
                this.highlightLine();
            }
        });
        events.subscribe("layout.build", function() {
            layout = require("3");
        });
        events.subscribe("layout.build", editor.init.bind(editor));
        events.subscribe("tinker.save", editor.save.bind(editor));
        events.subscribe("layout.activate", editor.refresh.bind(editor));
        events.subscribe("layout.dragEnd", editor.refresh.bind(editor));
    },
    a: function(require, module, exports, global) {
        "use strict";
        log("editor/behaviour.js");
        var events = require("1");
        var base = require("8");
        var layout;
        var editor = Object.merge({}, base, {
            build: function() {
                this.panel = layout.getPanel(2);
                if (!this.panel) {
                    return false;
                }
                this.frame = new Element("div.frame");
                this.textarea = new Element("textarea", {
                    name: "interaction"
                });
                this.settings = new Element("div.settings", {
                    text: "JS"
                });
                this.frame.adopt(this.textarea, this.settings).inject(this.panel.getInner());
                var options = Object.append({
                    mode: "text/javascript",
                    value: this.textarea.get("value")
                }, this.mirrorOptions);
                this.codemirror = CodeMirror(this.frame, options);
                this.textarea.addClass("is-hidden");
                this.highlightLine();
            }
        });
        events.subscribe("layout.build", function() {
            layout = require("3");
        });
        events.subscribe("layout.build", editor.init.bind(editor));
        events.subscribe("tinker.save", editor.save.bind(editor));
        events.subscribe("layout.activate", editor.refresh.bind(editor));
        events.subscribe("layout.dragEnd", editor.refresh.bind(editor));
    },
    b: function(require, module, exports, global) {
        "use strict";
        log("result/default.js");
        var events = require("1");
        var layout;
        var result = {
            init: function() {
                this.build();
            },
            build: function() {
                log("result.default.build();");
                this.panel = layout.getPanel(3);
                log("result build", this.panel);
                if (!this.panel) {
                    return;
                }
                this.wrapper = this.panel.getInner();
                this.frame = new Element("div.frame");
                this.iframe = new Element("iframe", {
                    name: "sandbox"
                });
                this.frame.adopt(this.iframe).inject(this.wrapper);
                events.publish("result.build");
            },
            buildOverlay: function() {
                log("result.default.buildOverlay();");
                if (!this.overlay) {
                    this.overlay = new Element("div", {
                        styles: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            zIndex: 2,
                            opacity: 1,
                            background: "transparent"
                        }
                    });
                }
            },
            showOverlay: function() {
                log("result.default.showOverlay();");
                this.buildOverlay();
                this.overlay.inject(this.wrapper);
            },
            hideOverlay: function() {
                log("result.default.hideOverlay();");
                this.overlay.dispose();
            },
            getPanel: function() {
                return this.panel;
            }
        };
        events.subscribe("layout.build", function() {
            layout = require("3");
        });
        events.subscribe("layout.build", result.init.bind(result));
        events.subscribe("layout.dragStart", result.showOverlay.bind(result));
        events.subscribe("layout.dragEnd", result.hideOverlay.bind(result));
    },
    c: function(require, module, exports, global) {
        "use strict";
        var events = require("1"), storage = require("6"), layout, spec = {}, handles = new Elements, dragOptions = {};
        var relativeSizes = [ {
            x: 33,
            y: 50
        }, {
            x: 33,
            y: 0
        }, {
            x: 34,
            y: 100
        }, {
            x: 0,
            y: 100
        } ];
        spec.activate = function(init) {
            relativeSizes = storage.get("layout0Sizes", relativeSizes);
            var dimensions = getDimensions();
            if (init) {
                layout.fx.set(dimensions);
                build();
                recalibrate();
                events.publish("layout.activate");
            } else {
                layout.fx.start(dimensions).chain(function() {
                    build();
                    recalibrate();
                    events.publish("layout.activate");
                });
            }
        };
        spec.deactivate = function() {
            log("layout.layouts.1.deactivate();");
        };
        var getDimensions = function() {
            var rs = relativeSizes, p = layout.panels, bSize = layout.body.getSize(), min = layout.min, opw = bSize.x / 100, oph = bSize.y / 100, d = {};
            d[0] = {
                top: 0,
                left: 0,
                width: Math.ceil(opw * rs[0].x),
                height: Math.ceil(oph * rs[0].y)
            };
            d[0].width = d[0].width < min.ox ? min.ox : d[0].width;
            d[0].height = d[0].height < min.oy ? min.oy : d[0].height;
            d[1] = {
                top: d[0].height,
                left: 0,
                width: Math.ceil(opw * rs[1].x),
                height: bSize.y - d[0].height
            };
            d[1].width = d[1].width < min.ox ? min.ox : d[1].width;
            d[2] = {
                top: 0,
                left: d[0].width,
                width: Math.ceil(opw * rs[2].x),
                height: bSize.y
            };
            d[2].width = d[2].width < min.ox ? min.ox : d[2].width;
            d[3] = {
                top: 0,
                left: d[0].width + d[2].width,
                width: bSize.x - (d[0].width + d[2].width),
                height: bSize.y
            };
            return d;
        };
        var build = function() {
            if (handles.length === 0) {
                handles.push((new Element("div.handle.horz.h1")).store("handleId", 0), (new Element("div.handle.vert.h2")).store("handleId", 1), (new Element("div.handle.vert.h3")).store("handleId", 2));
                handles.addEvent("mousedown", function(e) {
                    dragStart(e, e.target);
                });
            }
            handles.inject(layout.body);
        };
        var recalibrate = function() {
            var p = layout.panels, p0 = p[0].getCoords(), p2 = p[2].getCoords(), p3 = p[3].getCoords();
            handles[0].setStyles({
                top: p0.y2,
                left: p0.x1,
                width: p0.x2 - p0.x1
            });
            handles[1].setStyles({
                top: p0.y1,
                left: p0.x2,
                height: p2.y2 - p2.y1
            });
            handles[2].setStyles({
                top: p0.y1,
                left: p2.x2,
                height: p2.y2 - p2.y1
            });
        };
        var dragStart = function(e, handle) {
            e.stop();
            var p = layout.panels, d = dragOptions, p1, p2;
            d.handle = handle;
            d.handleId = handle.retrieve("handleId");
            d.handlePos = handle.getPosition(layout.body);
            d.handleSize = handle.getSize();
            d.mousePos = e.client;
            events.publish("layout.dragStart");
            switch (d.handleId) {
              case 0:
                p1 = p[0].getCoords();
                p2 = p[1].getCoords();
                break;
              case 1:
                p1 = p[0].getCoords();
                p2 = p[2].getCoords();
                break;
              case 2:
                p1 = p[2].getCoords();
                p2 = p[3].getCoords();
                break;
              default:
                log("Unhandled handleId: ", d.handleId);
                break;
            }
            d.box = {
                x1: p1.x1,
                y1: p1.y1,
                x2: p2.x2,
                y2: p2.y2
            };
            if (d.handle.hasClass("horz")) {
                d.limits = {
                    x1: d.box.x1,
                    x2: d.box.x1,
                    y1: d.box.y1 + 100,
                    y2: d.box.y2 - 100 - d.handleSize.y
                };
            } else {
                d.limits = {
                    x1: d.box.x1 + 200,
                    x2: d.box.x2 - 200 - d.handleSize.x,
                    y1: d.box.y1,
                    y2: d.box.y1
                };
            }
            document.addEvents({
                mousemove: drag,
                mouseup: dragEnd
            });
        };
        var drag = function(e) {
            var p = layout.panels, d = dragOptions, x = d.handlePos.x - (d.mousePos.x - e.client.x), y = d.handlePos.y - (d.mousePos.y - e.client.y);
            if (x < d.limits.x1) {
                x = d.limits.x1;
            }
            if (x > d.limits.x2) {
                x = d.limits.x2;
            }
            if (y < d.limits.y1) {
                y = d.limits.y1;
            }
            if (y > d.limits.y2) {
                y = d.limits.y2;
            }
            d.handle.setStyles({
                top: y,
                left: x
            });
            if (d.handleId === 0) {
                p[0].getOuter().setStyle("height", y + 5);
                p[1].getOuter().setStyles({
                    top: y + 5,
                    height: d.box.y2 - y
                });
            } else if (d.handleId === 1) {
                p[0].getOuter().setStyle("width", x + 5);
                p[1].getOuter().setStyle("width", x + 5);
                handles[0].setStyle("width", x - 5);
                p[2].getOuter().setStyles({
                    left: x + 5,
                    width: d.box.x2 - x
                });
            } else if (d.handleId === 2) {
                p[2].getOuter().setStyle("width", x - d.box.x1 + 10);
                p[3].getOuter().setStyles({
                    left: x + 5,
                    width: d.box.x2 - x
                });
            }
        };
        var dragEnd = function(e) {
            events.publish("layout.dragEnd");
            document.removeEvents({
                mousemove: drag,
                mouseup: dragEnd
            });
            storeSizes();
        };
        var resize = function() {
            var dimensions = getDimensions();
            layout.fx.set(dimensions);
            recalibrate();
        };
        var storeSizes = function() {
            var p = layout.panels, bSize = layout.body.getSize(), opw = bSize.x / 100, oph = bSize.y / 100, p0Size = p[0].getOuter().getSize(), p1Size = p[1].getOuter().getSize(), p2Size = p[2].getOuter().getSize(), p3Size = p[3].getOuter().getSize();
            relativeSizes = [ {
                x: Math.floor(p0Size.x / opw),
                y: Math.floor(p0Size.y / oph)
            }, {
                x: Math.floor(p1Size.x / opw),
                y: 0
            }, {
                x: Math.floor(p2Size.x / opw),
                y: 100
            }, {
                x: 0,
                y: 100
            } ];
            storage.set("layout0Sizes", relativeSizes);
        };
        events.subscribe("layout.build", function() {
            layout = require("3");
            layout.addLayout(spec);
        });
    },
    d: function(require, module, exports, global) {
        "use strict";
    }
});