var PortletsHandler = {
	portletStore : null,
	showDescription : function(href) {
		var instance = this;
		var pid = href.getAttribute("portletId");
		var record = instance.portletStore.getById(pid);
		var msg = record.get("description");
		alert(msg);
	},
	enableDD : function(store) {

		LayoutConfiguration._loadContent();

	},
	loadRemoteMetaData : function(portlets) {
		var instance = this;
		var ids = [];
		for (var i = 0; i < portlets.length; i++) {
			var id = portlets[i].portletid;
			ids.push(id);
		}
		Ext.Ajax.request({
					url : themeDisplay.getPathMain()
							+ "/portal/customRender_portletMetaData",
					method : 'post',
					params : {
						portletIds : ids
					},
					success : function(response, options) {
						var datas = Ext.decode(response.responseText);
						for (var i = 0; i < datas.length; i++) {
							portlets[i].author = datas[i].author;
							portlets[i].description = datas[i].description;
							portlets[i].imageUrl = datas[i].imageUrl;
							portlets[i].createDate = datas[i].createDate;
							portlets[i].accessTimes = datas[i].accessTimes;
						}
						var record = {
							portlets : portlets
						};
						instance.portletStore.loadData(record);
					}
				});
	},
	loadMetaData : function(portlet) {
		var instanceable = (portlet.instanceable == 'true');
		var plid = portlet.plid;
		var portletId = portlet.portletid;
		var portletUsed = portlet.isUsed;
		var headerPortalCssPaths = (portlet.headerportalcsspaths || '')
				.split(',');
		var headerPortletCssPaths = (portlet.headerportletcsspaths || '')
				.split(',');
		var footerPortalCssPaths = (portlet.footerportalcsspaths || '')
				.split(',');
		var footerPortletCssPaths = (portlet.footerportletcsspaths || '')
				.split(',');
		var portletMetaData = {
			instanceable : instanceable,
			plid : plid,
			portletId : portletId,
			portletPaths : {
				footer : footerPortletCssPaths,
				header : headerPortletCssPaths
			},
			portalPaths : {
				footer : footerPortalCssPaths,
				header : headerPortalCssPaths
			},
			portletUsed : portletUsed
		}
		return portletMetaData;
	},
	addPortlet : function(btn, options) {
		var instance = this;
		var plid = btn.getAttribute("portletId");
		var isUsed = btn.getAttribute("isUsed");
		var record = instance.portletStore.getById(plid);
		var data = record.data;
		var portletMetaData = instance.loadMetaData(data);
		if (isUsed != "true") {
			var plid = portletMetaData.plid;
			var portletId = portletMetaData.portletId;
			var isInstanceable = portletMetaData.instanceable;
			if (!isInstanceable) {
				btn.setAttribute("isUsed", "true");
			}
			var placeHolder = jQuery('<div class="loading-animation" />');
			var onComplete = null;
			var beforePortletLoaded = null;

			if (options) {
				var item = options.item;
				options.placeHolder = placeHolder[0];
				onComplete = options.onComplete;
				beforePortletLoaded = options.beforePortletLoaded;

				item.after(placeHolder);
				item.remove();
			} else {

				if (LayoutConfiguration._sortColumns) {
					LayoutConfiguration._sortColumns.filter(':first')
							.prepend(placeHolder);
				}
			}

			var portletOptions = {
				beforePortletLoaded : beforePortletLoaded,
				onComplete : onComplete,
				plid : plid,
				portletId : portletId,
				placeHolder : placeHolder
			}

			var portletPosition = Liferay.Portlet.add(portletOptions);
			LayoutConfiguration._loadPortletFiles(portletMetaData);

		} else {

			alert("该应用已经添加了");
		}
	},

	onPortletClose : function(event, portletData) {

	},
	displayWin : function(message) {

		var tempDiv = document.createElement("div");
		tempDiv.setAttribute("style", "display:none;");
		tempDiv.innerHTML = message;
		document.body.appendChild(tempDiv);

		var instance = this;
		var datas = instance.parseData();
		var porltetRecord = Ext.data.Record.create(['portletid', 'title',
				'instanceable', 'headerportletcsspaths',
				'headerportalcsspaths', 'footerportletcsspaths',
				'footerportalcsspaths', 'plid', 'author', 'description',
				'createDate', 'imageUrl', 'accessTimes', 'isUsed', 'p_clazz']);
		var dataViewStore = new Ext.data.Store({
					proxy : new Ext.data.MemoryProxy(),
					reader : new Ext.data.JsonReader({
								root : 'portlets',
								idProperty : 'portletid'
							}, porltetRecord),
					listeners : {
						'load' : function(store, records, options) {
							instance.enableDD(store);
						}
					}
				});
		instance.portletStore = dataViewStore;
		var portletHtml = '<div>'
				+ '<table border="1" width="420" align="center" class="customPortletView">'
				+ '<tr class="customPortletView"><td rowspan="5" width="120" class="customPortletView">'
				+ '<img src="{imageUrl}" width="120" height="100" title="{title}"></td>'
				+ '<td colspan="2" align="center" width="220" class="customPortletView">{title}</td>'
				+ '<td align="center" class="customPortletView"><input type="button" value="添加" portletId="{portletid}" id="portletAddBtn_{portletid}", isUsed="{isUsed}" onclick="javascript:PortletsHandler.addPortlet(this)"/></td></tr>'
				+ '<tr class="customPortletView"><td align="center" class="customPortletView">作者:</td><td align="center" class="customPortletView">{author}</td><td rowspan="4" class="customPortletView"><div class="{p_clazz}" portletid="{portletid}" title="{title}" plid="{plid}" instanceable="{instanceable}">拖动</div></td></tr>'
				+ '<tr class="customPortletView"><td align="center" class="customPortletView">简介:</td><td align="center" class="customPortletView">'
				+ '<a href="javascript:void(0);" portletid="{portletid}" onclick="javascript:PortletsHandler.showDescription(this)">{description:ellipsis(10)}<a></td></tr>'
				+ '<tr class="customPortletView"><td align="center" class="customPortletView">创建时间:</td><td align="center" class="customPortletView">{createDate}</td></tr>'
				+ '<tr class="customPortletView"><td align="center" class="customPortletView">使用次数:</td><td align="center" class="customPortletView">{accessTimes}</td></tr>'
				+ '</table></div>';

		var tpl = new Ext.XTemplate(
				'<div id="ucit_njm_custom_portletContent"><p>',
				'<tpl for="."><div class="portlet-wrap"   style="width:550;">',
				portletHtml, '</div><p></tpl></div>');
		var portletDataView = new Ext.DataView({
					store : dataViewStore,
					tpl : tpl,
					loadMask : true,
					loadingText : '加载中...',
					autoScroll : true,
					height : 400,
					multiSelect : false,
					overClass : 'x-view-over',
					itemSelector : 'div.portlet-wrap',
					emptyText : '没有相关的Portlet'
				});
		var leftPanel = new Ext.tree.TreePanel({
					region : 'west',
					title : '分类',
					width : 200,
					frame : true,
					collapsible : true,
					autoScroll : true,
					split : true,
					loader : new Ext.tree.TreeLoader(),
					rootVisible : false,
					root : new Ext.tree.AsyncTreeNode({
								expanded : true,
								children : datas
							}),
					listeners : {
						'click' : function(node, event) {
							var portlets = node.attributes.portlets;
							instance.loadRemoteMetaData(portlets);

						}
					}
				});
		var centerPanel = new Ext.Panel({
					region : 'center',
					title : '预览',
					layout : 'fit',
					baseCls : 'custom_portletContent',
					width : 500,
					autoScroll : true,
					items : [portletDataView]
				});
		var displayWin = new Ext.Window({
					width : 700,
					height : 400,
					title : '展示窗口',
					layout : 'border',
					items : [leftPanel, centerPanel],
					listeners : {
						'close' : function() {
							document.body.removeChild(tempDiv);
							LayoutConfiguration.menu = null;
						}
					}

				});
		displayWin.show();

	},
	_parseData : function(content) {
		var categoryName = content.children[0].children[0].innerHTML;
		var categoryWraper = content.children[1];
		var categoryDivs = categoryWraper.children;
		var category = {
			text : categoryName,
			cls : 'folder',
			leaf : false,
			portlets : [],
			children : []
		};
		for (var i = 0; i < categoryDivs.length; i++) {
			var categoryDiv = categoryDivs[i];
			var clazz = categoryDiv.getAttribute("class");
			if (clazz.indexOf("lfr-add-content") != -1) {
				var subChildren = PortletsHandler._parseData(categoryDiv);
				category.children.push(subChildren);
			} else {

				var portlet = {
					p_clazz : clazz,
					isUsed : clazz.indexOf("lfr-portlet-used") != -1,
					title : categoryDiv.getAttribute("title"),
					portletid : categoryDiv.getAttribute("portletid"),
					instanceable : categoryDiv.getAttribute("instanceable"),
					headerportletcsspaths : categoryDiv
							.getAttribute("headerportletcsspaths"),
					headerportalcsspaths : categoryDiv
							.getAttribute("headerportalcsspaths"),
					footerportletcsspaths : categoryDiv
							.getAttribute("footerportletcsspaths"),
					footerportalcsspaths : categoryDiv
							.getAttribute("footerportalcsspaths"),
					plid : categoryDiv.getAttribute("plid")

				};
				category.portlets.push(portlet);
			}
		}
		return category;

	},

	parseData : function() {
		var data = [];
		var instance = this;
		var dialog = document.getElementById("portal_add_content");
		var form = dialog.children[0].children[0];
		var contents = form.children;
		var len = contents.length;
		var realContents = [];
		for (var i = 0; i < len; i++) {
			var content = contents[i];
			var clazz = content.getAttribute("class");
			if (clazz && clazz.indexOf("lfr-add-content") != -1) {
				var category = PortletsHandler._parseData(content);
				data.push(category);
			}
		}

		return data;

	}

};
