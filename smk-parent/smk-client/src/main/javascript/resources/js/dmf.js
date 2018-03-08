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