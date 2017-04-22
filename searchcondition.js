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
				value : ["1","2"],
				placeHolder : "请输入成绩",
				type : "mulSelect",
				dataType : "array",
				arrayData : [{value:"0", text:"S"},{value:"1", text:"A"},{value:"2", text:"B"},{value:"3", text:"C"},{value:"4", text:"D"},{value:"5", text:"E"}]
			},
			{
				labelText : "大学生年级",
				id	 : "sgrade",
				name : "sgrade",
				value : "1",
				placeHolder : "请输入年级",
				type : "select",
				dataType : "array",
				arrayData : [{value:"1", text:"大一"},{value:"2", text:"大二"},{value:"3", text:"大三"},{value:"4", text:"大四"}]
			},
			{
				labelText : "大学生入学时间",
				id	 : "enterdate",
				name : "enterdate",
				valueStart : "2017-09-01 00:00:00",
				valueEnd : "2017-09-01 00:00:00",
//				format : "YYYY-MM-DD hh:mm:ss",
				placeHolderStart : "请输入入学开始时间",
				placeHolderEnd : "请输入入学结束时间",
				type : "datePicker"
			}
			
		]
	});
	
});