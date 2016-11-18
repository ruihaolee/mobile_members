var commonFuns = {
	temInputJson : {},
	flag : 0,
	get_inputValue : function(nowElement, callback){
		if (callback) {
			this.get_inputValue.callback = callback;
		}
		this.flag++;
		var nowFlag = this.flag;
		var nowChildElements = nowElement.children();
		for(var i = 0; i < nowChildElements.length; i++){
			if (nowChildElements[i] instanceof HTMLInputElement || nowChildElements[i] instanceof HTMLSelectElement) {
				var inputName = nowChildElements[i].getAttribute('name');
				this.temInputJson[inputName] = nowChildElements[i].value;
			}
			this.get_inputValue($(nowChildElements[i]));
		}
		if (nowFlag === 1) {
			this.flag = 0;
			this.get_inputValue.callback(this.temInputJson);
		}
		// console.log($(nowElement).children());
	}	
};

var cutImg = {
	coordXY : {},
	nowJcrop : null,
	startCut : function(){
		function showPreview(obj){
			cutImg.coordXY.x = obj.x;
			cutImg.coordXY.y = obj.y;
			cutImg.coordXY.width = obj.w;
			cutImg.coordXY.height = obj.h;
			// console.log(cutImg.coordXY);
			$('#previewImg').attr('src', handle.loadImg);
			//console.log(cutImg.coordXY);
			if (parseInt(obj.w) > 0) {
                var rx = $("#preview_box").width() / obj.w;  
                var ry = $("#preview_box").height() / obj.h; 
                $("#previewImg").css( {  
                    width : Math.round(rx * $("#shadow-before").width()) + "px", //预览图片宽度为计算比例值与原图片宽度的乘积  
                    height : Math.round(rx * $("#shadow-before").height()) + "px", //预览图片高度为计算比例值与原图片高度的乘积  
                    marginLeft : "-" + Math.round(rx * obj.x) + "px",  
                    marginTop : "-" + Math.round(ry * obj.y) + "px"  
                });                  				
			}
		}
		$('#shadow-before').Jcrop({
			aspectRatio : 1,
			onChange : showPreview,
			onSelect : showPreview,
			bgFade : true,
			minSize : [100, 100]
		},function(){
			cutImg.nowJcrop = this;
		});
	}
};
var handle = {
	file : null,
	checkJson : function (inforJson){
		for(var name in inforJson){
			if(!inforJson[name]){
				return {
					succuss : false,
					reason : '请检查是否遗漏没填的选项'
				};
			}
		}
		if (!(/^1[34578]\d{9}$/.test(inforJson['tel']))) {
			return {
				succuss : false,
				reason : '手机号码有误,请检查'
			};
		}
		return{
			succuss : true
		};
	},
	submitClickHandle : function(event){
		commonFuns.get_inputValue($('#infor'),(function(inforJson){
			inforJson.sign = $('#say-area').val();
			var result = this.checkJson(inforJson);
			if (!result.succuss) {
				alert(result.reason);
				return;
			}

			if (!handle.file) {
				alert('请选择照片作为头像~');
				return;
			}
			else if(handle.file.size >= 2097152){//大于2M
				alert('请选择小于2MB的照片');
				return;
			}
			inforJson.gender = parseInt(inforJson.gender);
			inforJson.year = parseInt(inforJson.year);
			this.ajaxUplod(inforJson);
		}).bind(this));
	},
	ajaxUplod : function(inforJson){
		// if (!fileJson['x']){
		// 	console.log('no Jcrop');
		// }
		$.ajax({
			url : 'http://member.xiyoumobile.com/api/member/submit',
			data : inforJson,
			type : 'POST',
			dataType : 'json',
			success : function(data){
				var fileJson = {};
				for(var name in cutImg.coordXY){
					fileJson[name] = cutImg.coordXY[name];
				}
				fileJson.image = handle.file;
				fileJson.username = data.data;

				var formData = new FormData();
				// if (!fileJson['x']) {
				// 	// console.log()
				// 	fileJson['x'] = 0;
				// 	fileJson['y'] = 0;
				// 	fileJson['width'] = $(window).width() * 0.4;
				// 	fileJson['height'] = $(window).width() * 0.4;
				// }
				for(var name in fileJson){
					formData.append(name, fileJson[name]);
				}
				// console.log(fileJson);
				// formData.append('file', fileJson.image);
				console.log(fileJson);
				$('#submit-button').text('正在提交....');
				// console.log(formData);
				$.ajax({
					url : 'http://member.xiyoumobile.com/api/upload/avatar/2',
					type : 'POST',
				    cache: false,
				    async: false,
				    data: formData,
				    processData: false,
				    contentType: false
				}).done(function(res) {
					$('#submit-button').text('提交');
					alert('上传成功！');
				}).fail(function(res) {
					$('#submit-button').text('提交');
					alert('上传失败！');
				});
			}
		})
	//	console.log(inforJson);
	},
	fileChangeHandle : function(){
		var windowURL = window.URL || window.webkitURL;
		this.loadImg = windowURL.createObjectURL($('#file')[0].files[0]);
		handle.file = $('#file')[0].files[0];
		var shadowImgbefore = $(window).width() * 0.4;
		if ((handle.file.type != 'image/png') && (handle.file.type != 'image/jpeg')) {
			alert('请选择png/jpg格式的文件');
			handle.file = null;
			return;
		}

		var _userImg = new Image();
		_userImg.src = this.loadImg;
		_userImg.onload = function(){
			var maxWH = ($(window).width() * 0.4) / $(window).height();
			var nowWH = _userImg.width / _userImg.height;
			// if (nowWH <= maxWH) {
			// 	var maxWHalert = Math.floor(maxWH * 100) / 100;
			// 	alert('请选择 宽/高 大于 ' + (maxWHalert * 100) + '%' + ' 的图片');
			// 	return;
			// }
			setShadow();
		} 

		function setShadow(){
			$('#file').val('');
			$('#imgBefore').attr('src', handle.loadImg);
			$('#shadow-before').attr('src', handle.loadImg);
			$('#shadow-before').css('width', shadowImgbefore + 'px');
			$('.shadow').css('display', 'block');
			//计算比例
			var userImg = new Image();
			userImg.src = handle.loadImg;
			userImg.onload  = (function(){
				this.coordXY.rate = Math.round(($('#shadow-before').width() / userImg.width)*100) / 100;
				// console.log($('.shadow-beforeBox').height());
				$('.shadow-beforeBox').css({
					marginTop : (-0.5 * $('.shadow-beforeBox').height()) + 'px' 
				});
				cutImg.startCut();
			}).bind(cutImg);			
		}
	},
	cutOKclickHandle : function(){
		console.log(cutImg.coordXY);
		if (!cutImg.coordXY.width) {
			alert('学长/姐 请截取图片~谢谢合作^ ^');
			return;
		}
		$('.shadow').css('display', 'none');
		$('#previewImg').attr('src', '');
        var rx = $(".img-before").width() / cutImg.coordXY.width;  
        var ry = $(".img-before").height() / cutImg.coordXY.height; 
        $("#imgBefore").css( {  
            width : Math.round(rx * $("#shadow-before").width()) + "px", //预览图片宽度为计算比例值与原图片宽度的乘积  
            height : Math.round(rx * $("#shadow-before").height()) + "px", //预览图片高度为计算比例值与原图片高度的乘积  
            marginLeft : "-" + Math.round(rx * cutImg.coordXY.x) + "px",  
            marginTop : "-" + Math.round(ry * cutImg.coordXY.y) + "px"  
        });

        cutImg.nowJcrop.destroy();
	}
}
var init = function(){
	$('#submit-button').bind('click', handle.submitClickHandle.bind(handle));
	$('#file').bind('change', handle.fileChangeHandle.bind(handle));
	$('#cutOK').bind('click', handle.cutOKclickHandle);
}
window.onload = function(){
	init();
}