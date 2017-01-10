(function(){var t,e,r,o,n,s,i,a,c,u=[].indexOf||function(t){for(var e=0,r=this.length;r>e;e++)if(e in this&&this[e]===t)return e;return-1};Backbone.DualStorage={offlineStatusCodes:[408,502]},Backbone.Model.prototype.hasTempId=function(){return _.isString(this.id)&&36===this.id.length&&0===this.id.indexOf("t")},n=function(t,e){return e||(e=t.model.prototype),_.result(t,"storeName")||_.result(e,"storeName")||_.result(t,"url")||_.result(e,"urlRoot")||_.result(e,"url")},Backbone.Collection.prototype.syncDirty=function(t){var e,r,o,s,i,a,c;for(c=localStorage.getItem(n(this)+"_dirty"),o=c&&c.split(",")||[],a=[],e=0,s=o.length;s>e;e++)r=o[e],a.push(null!=(i=this.get(r))?i.save(null,t):void 0);return a},Backbone.Collection.prototype.dirtyModels=function(){var t,e,r,o;return o=localStorage.getItem(n(this)+"_dirty"),e=o&&o.split(",")||[],r=function(){var r,o,n;for(n=[],r=0,o=e.length;o>r;r++)t=e[r],n.push(this.get(t));return n}.call(this),_.compact(r)},Backbone.Collection.prototype.syncDestroyed=function(t){var e,r,o,s,i,a,c;for(c=localStorage.getItem(n(this)+"_destroyed"),o=c&&c.split(",")||[],a=[],e=0,s=o.length;s>e;e++)r=o[e],i=new this.model,i.set(i.idAttribute,r),i.collection=this,a.push(i.destroy(t));return a},Backbone.Collection.prototype.destroyedModelIds=function(){var t,e;return e=localStorage.getItem(n(this)+"_destroyed"),t=e&&e.split(",")||[]},Backbone.Collection.prototype.syncDirtyAndDestroyed=function(t){return this.syncDirty(t),this.syncDestroyed(t)},t=function(){return(65536*(1+Math.random())|0).toString(16).substring(1)},window.Store=function(){function e(t){this.name=t,this.records=this.recordsOn(this.name)}return e.prototype.sep="",e.prototype.generateId=function(){return"t"+t().substring(1)+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()},e.prototype.save=function(){return localStorage.setItem(this.name,this.records.join(","))},e.prototype.recordsOn=function(t){var e;return e=localStorage.getItem(t),e&&e.split(",")||[]},e.prototype.dirty=function(t){var e;return e=this.recordsOn(this.name+"_dirty"),_.include(e,t.id.toString())||(e.push(t.id),localStorage.setItem(this.name+"_dirty",e.join(","))),t},e.prototype.clean=function(t,e){var r,o;return o=this.name+"_"+e,r=this.recordsOn(o),_.include(r,t.id.toString())&&localStorage.setItem(o,_.without(r,t.id.toString()).join(",")),t},e.prototype.destroyed=function(t){var e;return e=this.recordsOn(this.name+"_destroyed"),_.include(e,t.id.toString())||(e.push(t.id),localStorage.setItem(this.name+"_destroyed",e.join(","))),t},e.prototype.create=function(t,e){return _.isObject(t)?(t.id||t.set(t.idAttribute,this.generateId()),localStorage.setItem(this.name+this.sep+t.id,JSON.stringify(t.toJSON?t.toJSON(e):t)),this.records.push(t.id.toString()),this.save(),t):t},e.prototype.update=function(t,e){return localStorage.setItem(this.name+this.sep+t.id,JSON.stringify(t.toJSON?t.toJSON(e):t)),_.include(this.records,t.id.toString())||this.records.push(t.id.toString()),this.save(),t},e.prototype.clear=function(){var t,e,r,o;for(o=this.records,t=0,r=o.length;r>t;t++)e=o[t],localStorage.removeItem(this.name+this.sep+e);return this.records=[],this.save()},e.prototype.hasDirtyOrDestroyed=function(){return!_.isEmpty(localStorage.getItem(this.name+"_dirty"))||!_.isEmpty(localStorage.getItem(this.name+"_destroyed"))},e.prototype.find=function(t){var e;return e=localStorage.getItem(this.name+this.sep+t.id),null===e?null:JSON.parse(e)},e.prototype.findAll=function(){var t,e,r,o,n;for(o=this.records,n=[],t=0,r=o.length;r>t;t++)e=o[t],n.push(JSON.parse(localStorage.getItem(this.name+this.sep+e)));return n},e.prototype.destroy=function(t){return localStorage.removeItem(this.name+this.sep+t.id),this.records=_.reject(this.records,function(e){return e===t.id.toString()}),this.save(),t},e}(),window.Store.exists=function(t){return null!==localStorage.getItem(t)},r={needsTranslation:"0.9.10"===Backbone.VERSION,forBackboneCaller:function(t){return this.needsTranslation?function(e,r,o){return t.call(null,r)}:t},forDualstorageCaller:function(t,e,r){return this.needsTranslation?function(o){return t.call(null,e,o,r)}:t}},s=function(t,e,r){var o,n,s,i;if(o="clear"===t||"hasDirtyOrDestroyed"===t,o||(o=e instanceof Backbone.Model),o||(o=e instanceof Backbone.Collection),!o)throw new Error("model parameter is required to be a backbone model or collection.");return i=new Store(r.storeName),s=function(){switch(t){case"read":return e instanceof Backbone.Model?i.find(e):i.findAll();case"hasDirtyOrDestroyed":return i.hasDirtyOrDestroyed();case"clear":return i.clear();case"create":return r.add&&!r.merge&&(n=i.find(e))?n:(e=i.create(e,r),r.dirty&&i.dirty(e),e);case"update":return i.update(e,r),r.dirty?i.dirty(e):i.clean(e,"dirty");case"delete":return i.destroy(e),r.dirty&&!e.hasTempId()?i.destroyed(e):e.hasTempId()?i.clean(e,"dirty"):i.clean(e,"destroyed")}}(),s&&(s.toJSON&&(s=s.toJSON(r)),s.attributes&&(s=s.attributes)),r.ignoreCallbacks||(s?r.success(s):r.error("Record not found")),s},c=function(t,e){return t&&t.parseBeforeLocalSave?_.isFunction(t.parseBeforeLocalSave)?t.parseBeforeLocalSave(e):void 0:e},i=function(t,e){var r;return r=new Backbone.Model,r.idAttribute=t.idAttribute,r.set(t.attributes),r.set(t.parse(e)),r},e=Backbone.DualStorage.originalSync=Backbone.sync,a=function(t,e,o){return o.success=r.forBackboneCaller(o.success),o.error=r.forBackboneCaller(o.error),Backbone.DualStorage.originalSync(t,e,o)},o=function(t,e,o){var l,d,h,f,p,y,g;if(o.storeName=n(e.collection,e),o.storeExists=Store.exists(o.storeName),o.success=r.forDualstorageCaller(o.success,e,o),o.error=r.forDualstorageCaller(o.error,e,o),_.result(e,"remote")||_.result(e.collection,"remote"))return a(t,e,o);if(h=_.result(e,"local")||_.result(e.collection,"local"),o.dirty=o.remote===!1&&!h,o.remote===!1||h)return s(t,e,o);switch(o.ignoreCallbacks=!0,p=o.success,l=o.error,g=function(){return o.dirty=!0,o.ignoreCallbacks=!1,o.success=p,o.error=l,s(t,e,o)},d=function(t){var e,r;return e=Backbone.DualStorage.offlineStatusCodes,_.isFunction(e)&&(e=e(t)),0===t.status||(r=t.status,u.call(e,r)>=0)},f=function(e){var r;return r=!d(e),r||"read"===t&&!o.storeExists?l(e):g()},t){case"read":return s("hasDirtyOrDestroyed",e,o)?g():(o.success=function(t,r,n){var a,u,l,h,f,y;if(d(o.xhr))return g();if(t=c(e,t),e instanceof Backbone.Collection)for(a=e,l=a.model.prototype.idAttribute,o.add||s("clear",a,o),u=0,h=t.length;h>u;u++)f=t[u],e=a.get(f[l]),y=e?i(e,f):new a.model(f),s("update",y,o);else y=i(e,t),s("update",y,o);return p(t,r,n)},o.error=function(t){return f(t)},o.xhr=a(t,e,o));case"create":return o.success=function(r,n,a){var c;return d(o.xhr)?g():(c=i(e,r),s(t,c,o),p(r,n,a))},o.error=function(t){return f(t)},o.xhr=a(t,e,o);case"update":return e.hasTempId()?(y=e.id,o.success=function(t,r,n){var a;return e.set(e.idAttribute,y,{silent:!0}),d(o.xhr)?g():(a=i(e,t),s("delete",e,o),s("create",a,o),p(t,r,n))},o.error=function(t){return e.set(e.idAttribute,y,{silent:!0}),f(t)},e.set(e.idAttribute,null,{silent:!0}),o.xhr=a("create",e,o)):(o.success=function(r,n,a){var c;return d(o.xhr)?g():(c=i(e,r),s(t,c,o),p(r,n,a))},o.error=function(t){return f(t)},o.xhr=a(t,e,o));case"delete":return e.hasTempId()?(o.ignoreCallbacks=!1,s(t,e,o)):(o.success=function(r,n,i){return d(o.xhr)?g():(s(t,e,o),p(r,n,i))},o.error=function(t){return f(t)},o.xhr=a(t,e,o))}},Backbone.sync=o}).call(this);