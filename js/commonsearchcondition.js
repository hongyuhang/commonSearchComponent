(function ($) {
	$.fn.HyhSearchCondition = {
		version : "1.01",
		// 默认设置
		defaults : {
			doSearch : false,	// 当doSearch为true时，autoSearch,byAjax,ajaxType,url参数才有效
			autoSearch : false,
			byAjax : false,
			ajaxType : 'post', 
			url : '', 
			formId : "searchConditionForm",
			formName : "searchConditionForm",
			conditions : []		// 搜索字段集合，也可以是表达复杂对象的json对象
//			{
//				"labelText" : "显示名",
//				"id"	 : "id",
//				"name" : "name",
//				"type" : "text, select, mulSelect, datePicker",
//				"isCache" : "true",
//				"placeHolder" : "",
//				"need" : "",
//				"value" : "",
//				"dataType" : "array, ajax", //本选项再text之外的情况下有效，ajax的时候ajaxUrl有效, array时arrayData有效
//				"ajaxUrl" : 
//				"arrayData" : [],	// {"value":value, "text":text}
//				"relationElementId" : "", 
//				"cacheSelectData" : [], // 内部用，不需作为参数使用，即使传递也会被覆盖的
//				"dom"				// 内部用，不需作为参数使用，即使传递也会被覆盖的，把dom对象做一个副本，不用每次都重新建立
//			}
		},
		
		 /* @param {String} containerId	容器的元素id
		  * @param {Object} options		初始化的可选项*/
		init : function(containerId, options) {
			if (!$('#' + containerId)) {
				console.log("不存在ID为" + containerId + "的元素");
				return null;
			}
			
			var opts = $.extend(true, {}, $.fn.HyhSearchCondition.defaults, options);
			var searchCondition = new SearchCondition(containerId, opts);
			searchCondition.initial();
		}
	};
})(jQuery);
/**
 * 一个通用的搜索框组件, 可以自动布局，需要后台数据支持的控件初始化，控件关联设定
 * @param {String} containerId	容器的元素id
 * @param {Object} options		初始化的可选项
 */
function SearchCondition(containerId, options){
	// 容器id
	this.containerId = containerId;
	// 默认的选项
	this.options = options;
	// 组件集合
	this._labels = [];
	this._components = [];
	var self = this;
	this.cache = {};		// 如果是select, mulSelect的情况下，并且是ajax请求的数据，可以使用缓存数据
	
	this.initial = function() {
		if (!this.options.conditions || this.options.conditions.length == 0) {
			return;
		}
		
		var container = this._createSearchContainer();
		var toolBarRow = this._createSearchToolBar();
		var showSelectConditionArea = this._createShowSelectConditions();
		
		container.append(toolBarRow);
		container.append(showSelectConditionArea);
		$('#' + this.containerId).append(container);
		
		this._registHandle();
		
		this._handleDefaultConditionValue();
	}
	
	/**
	 * 注册各种事件处理
	 */
	this._registHandle = function() {
		// 下拉条件选择组件：每当点击对应的条件，需要切换按钮的文字显示还有切换通用搜索框的形态和文字
		$.each($('#conditionLists').children(), function(i, obj) {
			$(obj).click(function(){
				var conditionObj = self.options.conditions[i];
				// 切换下拉条件选择组件的显示
				if (conditionObj.need) {
					$('#conditionSelectButton').html('<span class="glyphicon glyphicon-star" style="color:black;" aria-hidden="true"></span>' + conditionObj.labelText + '<span class="caret"></span>');
				} else {
					$('#conditionSelectButton').html('<span class="glyphicon glyphicon-star-empty" style="color:black;" aria-hidden="true"></span>' + conditionObj.labelText + '<span class="caret"></span>');
				}
				
				// 切换通用搜索组件的显示
				self._clearSearchInputComponent();
				var component = self._createSearchInputComponent(i, conditionObj);

				$('#searchBtnGroup').after(component);
//					mulSelect.selectpicker('render');
				if (conditionObj.type == "select" || conditionObj.type == "mulSelect") {
					component.selectpicker('val', conditionObj.value);
				}

//				// 给通用搜索组件添加change事件,关联显示到条件展示区
//				self._handleCommonSearchInputChange();
				$('#commonSearchInput').focus();
				$('#commonSearchInput').select();
			});
		});
		// 搜索按钮：click事件
		
		// 重置按钮：click事件
		$('#reset').click(function() { 
			// 清空条件展示区
			$('#selectedConditionShowArea').children().remove();
			// 展示区隐藏
			$('#showSelCondRow').hide();
			// 清空内部数据的value值
			$.each(self.options.conditions, function(i, obj) {
				obj.value = "";
			});
			// 清空通用组件搜索组件的value值
			var index = $('#commonSearchInput').attr("hIndex");
			var condition = self.options.conditions[index];
			
			// 需要考虑其他种类的控件形式
			if (condition.type == "text" || condition.type == "datePicker") {
				$('#commonSearchInput').val("");
			}
			
			if (condition.type == "select" || condition.type == "mulSelect") {
				$('#commonSearchInput').selectpicker('val', '');
			}
		});
		
//		// 搜索框组件：change事件
//		this._handleCommonSearchInputChange();
	}
	
	/**
	 * 创建一个搜索框组件
	 */
	this._createSearchInputComponent = function(index, condition) {
		var component = "";
		switch (condition.type) {
			case "text":
				// 是否有缓存过的dom
				if (condition.dom) {
					component = $.extend(true, {}, condition.dom);
					component.val(condition.value);
					component.attr('hIndex', index);
					component.attr('placeholder', condition.placeHolder);
				} else {
					component = $('<input hIndex="' + index + '" id="commonSearchInput" type="text" class="form-control" aria-label="..." placeholder="' + condition.placeHolder + '" value="' + condition.value+ '"></input>');
					component.bind({
			            paste : function() {
			                self._relationUpdate();
			            },
			            cut : function() {
			                self._relationUpdate();
			            },
			            keyup : function() {
			            		self._relationUpdate();
			            }
					});
				}
//				$('#searchBtnGroup').after($(searchText));
				break;
			case "select":
			case "mulSelect":
				var multi = "";
				if (condition.type == "mulSelect") {
					multi = "multiple";
				}
				// 是否有缓存过的dom
				if (condition.dom) {
					component = $.extend(true, {}, condition.dom);
					component.attr('hIndex', index);
					component.attr('title', condition.placeHolder);
					component.bind({
			            change : function() {
			            		self._relationUpdate();
			            }
					});
				} else {
					var optData = [];
					var mulSelect = $('<select hIndex="' + index + '" id="commonSearchInput" class="selectpicker input-group-btn form-control" ' + multi + ' data-live-search="true" title="' + condition.placeHolder + '"></select>');
					// 本地数据的情况
					if (condition.dataType == "array") {
						if (!condition.cacheSelectData) {
							condition.cacheSelectData = condition.arrayData;
						}
						optData = condition.arrayData;
					}
					
					// ajax请求的情况
					if (condition.dataType == "ajax") {
						if (!condition.cacheSelectData) {
							// TODO:发送ajax请求，并显示遮罩,把返回的数据设置到对应的缓存上
						}
						// 使用缓存的情况下
						if (!condition.isCache) {
							// TODO:发送ajax请求，并显示遮罩,把返回的数据设置到对应的缓存上	
						} 
						optData = condition.cacheSelectData;
					}
					
					$.each(optData, function(j, tempOpt) {
						mulSelect.append($('<option value="' + tempOpt.value + '">' + tempOpt.text + '</option>'));
					});
					
					mulSelect.bind({
			            change : function() {
			            		self._relationUpdate();
			            }
					});
					
					if (condition.dataType == "array" 
							|| (condition.dataType == "ajax" && condition.isCache)) {
						condition.dom = mulSelect;
					}
					component = mulSelect;
				}
				
				break;
			case "datePicker":
				break;
		}
		return component;
	}
	
	/**
	 * 清除搜索框
	 */
	this._clearSearchInputComponent = function() {
		var index = $('#commonSearchInput').attr('hIndex');
		if (!index) {
			return;
		}
		
		var type = self.options.conditions[index].type;
		switch(type) {
			case "text":
				$('#commonSearchInput').remove();
				break;
			case "select":
			case "mulSelect":
				$('#commonSearchInput').selectpicker('destroy');
				$('#commonSearchInput').remove();
				break;
			case "datePicker":
				$('#commonSearchInput').remove();
				break;
		}
	}
	
	this._relationUpdate = function() {
		// 关联到内部数据的变化
		var index = $('#commonSearchInput').attr("hIndex");
		var value = $('#commonSearchInput').val();
		self.options.conditions[index].value = value;
		var condition = self.options.conditions[index];
		// 关联到条件展示区的变化
		// 找到关联的label
		var label = $('#selectedConditionShowArea').find('span[hIndex=' + index + ']');
		
		if (label.length == 0 && value != "") {
			// 向展示区域添加label
			switch (condition.type) {
				case "text" :
					label = $('<span style="margin-right:10px;margin-bottom:5px;display:inline-block;cursor:pointer;" hIndex="' + index + '" class="label label-info">' + condition.labelText + ':' + condition.value + '<a href="#"><span class="glyphicon glyphicon-remove" style="color:black;" aria-hidden="true"></span></a></span>');
					break;
				case "select" :
				case "mulSelect" :
					var textValue = self._createLabelValue(condition);
					label = $('<span style="margin-right:10px;margin-bottom:5px;display:inline-block;cursor:pointer;" hIndex="' + index + '" class="label label-info">' + condition.labelText + ':' + textValue + '<a href="#"><span class="glyphicon glyphicon-remove" style="color:black;" aria-hidden="true"></span></a></span>');
					break;
				case "datePicker" :
					break;
			}

			// 注册清除按钮的动作
			label.find('a').click(function(event){
				self._labelClearAction(this, event);
			});
			$('#selectedConditionShowArea').append(label);
			// 注册标签的点击动作
			label.click(function(){
				$('#conditionLists').children(':eq(' + index + ')').trigger("click");
			});
		}
		
		if (label.length > 0 && value != "") {
			var textValue = self._createLabelValue(condition);
			// 修改已有的label信息
			label.html(condition.labelText + ':' + textValue + '<a href="#"><span class="glyphicon glyphicon-remove" style="color:black;" aria-hidden="true"></span></a>');
			// 注册清除按钮的动作
			label.find('a').click(function(event){
				self._labelClearAction(this, event);
			});
		}
		
		if (label.length > 0 && value == "") {
			// 删除已有label
			label.remove();
		}
		
		if ($('#selectedConditionShowArea').children().length == 0) {
			// 展示区隐藏
			$('#showSelCondRow').hide();
		} else {
			// 搜索展示区显示
			$('#showSelCondRow').show();
		}
	}
	
	/**
	 * 创建标签的显示值
	 */
	this._createLabelValue = function(condition) {
		var textValue = "";
		
		switch (condition.type) {
			case "text" :
				textValue = condition.value;
				break;
			case "select" :
			case "mulSelect" :
				if (condition.value instanceof Array) {
					// 多选的情况
					$.each(condition.value, function(i, value) {
						$.each(condition.cacheSelectData, function(j, obj) {
							if (value == obj.value) {
								textValue = textValue + obj.text + ",";
							}
						});
					});
					textValue = textValue.substr(0, textValue.length - 1);
				} else {
					$.each(condition.cacheSelectData, function(j, obj) {
						if (condition.value == obj.value) {
							textValue = obj.text;
						}
					});
				}
				break;
			case "datePicker" :
				break;
		}
			
		return textValue;
	}
	
	/**
	 * 点击标签清除按钮的动作
	 */
	this._labelClearAction = function(element, event) {
		var type = this.options.conditions[$('#commonSearchInput').attr('hIndex')].type;
		// 如果要清除的条件正好是通用搜索框的条件的话，通过改变搜索框的值来触发清除事件
		if ($(element).parent().attr('hIndex') == $('#commonSearchInput').attr('hIndex')) {
			switch (type) {
				case "text" :
					$('#commonSearchInput').val("");
					$('#commonSearchInput').trigger("keyup");
					break;
				case "select" :
				case "mulSelect" :
					$('#commonSearchInput').selectpicker('val', '');
					$('#commonSearchInput').trigger("change");
					break;
				case "datePicker" :
					break;
			}
		} else {
			self.options.conditions[$(element).parent().attr('hIndex')].value = "";
			$(element).parent().remove();
			
			switch (type) {
				case "text" :
					$('#commonSearchInput').trigger("keyup");
					break;
				case "select" :
				case "mulSelect" :
					$('#commonSearchInput').trigger("change");
					break;
				case "datePicker" :
					break;
			}
		}
		event.stopPropagation(); 
	}
	
	/**
	 * 处理有搜索条件有默认值的情况
	 */
	this._handleDefaultConditionValue = function() {
		var firstIndex;
		$.each(self.options.conditions, function(i, obj) {
			if (obj.value && (obj.value != "")) {
				if (!firstIndex) {
					firstIndex = i;
				}
				
				$('#conditionLists').children(':eq(' + i + ')').trigger("click");
				if (!$('#commonSearchInput').hasClass('selectpicker')) {
					$('#commonSearchInput').val(obj.value);
					$('#commonSearchInput').trigger("keyup");
				} else {
					$('#commonSearchInput').selectpicker('val', obj.value);
					$('#commonSearchInput').trigger("change");
				}

			}
		});
		// 触发切换数据事件
		if (firstIndex) {
			$('#conditionLists').children(':eq(' + firstIndex + ')').trigger("click");
		} else {
			$('#conditionLists').children(':eq(0)').trigger("click");
		}
	}
	
	/**
	 * 创建搜索工具栏
	 */
	this._createSearchToolBar = function() {
		var row = $('<div class="row"></div>');
		var col12 = $('<div class="col-lg-12"></div>');
		var inputGroupBtn = $('<div class="input-group"></div>');
		// 下拉条件选择组件
		var btnGroup = $('<div id="searchBtnGroup" class="input-group-btn"></div>');
		var conditionSelBtn;
		if (this.options.conditions[0].need) {
			conditionSelBtn = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="conditionSelectButton"><span class="glyphicon glyphicon-star" style="color:black;" aria-hidden="true"></span>' + this.options.conditions[0].labelText + '<span class="caret"></span></button>');
		} else {
			conditionSelBtn = $('<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="conditionSelectButton"><span class="glyphicon glyphicon-star-empty" style="color:black;" aria-hidden="true"></span>' + this.options.conditions[0].labelText + '<span class="caret"></span></button>');
		}
		
		var conditionList = $('<ul class="dropdown-menu" id="conditionLists"></ul>');
		var index = 0;
		for(index in this.options.conditions){
			var li;
			if (this.options.conditions[index].need) {
				li = $('<li><a href="#" hIndex="' + index + '"><span class="glyphicon glyphicon-star" style="color:black;" aria-hidden="true"></span>' + this.options.conditions[index].labelText + '</a></li>');
			} else {
				li = $('<li><a href="#" hIndex="' + index + '"><span class="glyphicon glyphicon-star-empty" style="color:black;" aria-hidden="true"></span>' + this.options.conditions[index].labelText + '</a></li>');
			}
			index++;
			conditionList.append(li);
		}
		btnGroup.append(conditionSelBtn);
		btnGroup.append(conditionList);
		
		// 搜索，重置按钮
		var btns = '<div class="input-group-btn">';
		btns = btns + '<button class="btn btn-default" type="button">Go!</button>';
		btns = btns + '<button id="reset" class="btn btn-default" type="button">Reset</button>';
		btns = btns + '</div>';
		btns = $(btns);
		
		inputGroupBtn.append(btnGroup);
//		inputGroupBtn.append(searchText);
		inputGroupBtn.append(btns);
		
		col12.append(inputGroupBtn);
		
		row.append(col12);
		return row;
	}
	
	/**
	 * 创建已选择条件展示区域
	 */
	this._createShowSelectConditions = function() {
		// 初始状态为不显示
		var row = $('<div id="showSelCondRow" class="row" style="display:none;"></div>');
		var col12 = $('<div class="col-lg-12 col-sm-12 col-md-12"></div>');
		var panel = $('<div class="panel panel-default"></div>');
		var panelBody = $('<div class="panel-body" id="selectedConditionShowArea"></div>');
		
		panel.append(panelBody);
		col12.append(panel);
		row.append(col12);
		
		return row;
	}
	
	/**
	 * 创建通用搜索框的容器
	 */
	this._createSearchContainer = function() {
		var container = $('<div id="commonSearchContainer" class="container"></div>');
		var form = $('<form id="' + this.options.formId + '" name="' + this.options.formName + '"></form>');
		container.append(form);
		return container;
	}
}
