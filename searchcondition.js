$( document ).ready(function(){
	
	
	var searchCondition = $.fn.HyhSearchCondition.init("searchCondition", {
		conditions : [
			{
				labelText : "大学生学号",
				id	 : "sno",
				name : "sno",
				placeHolder : "请输入学号",
				type : "text"
			},
			{
				labelText : "大学生姓名",
				id	 : "sname",
				name : "sname",
				placeHolder : "请输入姓名",
				type : "text",
				value : "abc",
				need : true
			},
			{
				labelText : "大学生成绩",
				id	 : "sname",
				name : "sname",
				value : "1",
				placeHolder : "请输入成绩",
				type : "mulSelect",
				dataType : "array",
				arrayData : [{value:"1", text:"A"},{value:"2", text:"B"}]
			}
		]
	});
	
});