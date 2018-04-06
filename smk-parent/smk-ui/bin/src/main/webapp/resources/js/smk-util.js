function openMap(type)
{

	window.location.href = "./view.xhtml?id=" + getQueryString('id') + "&view=" + type;
}

var getQueryString = function ( field, url ) 
{
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);

    return string ? string[1] : null;
};

//generate a randomish guid
function uuid() 
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
	{
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

// file upload stuff
var fileContents;
var unsavedAttachments = [];

function readFile(e) 
{
	fileContents = null;
	
	var file = e.target.files[0];
	
	if (!file) 
	{
	    return;
	}
	
	fileContents = file;
}

var fileString;
function fileToString(file)
{
	fileString = null;
	var reader = new FileReader();
	
	reader.onload = function(e) 
	{
		fileString = e.target.result;
	};

	reader.readAsText(file);
}