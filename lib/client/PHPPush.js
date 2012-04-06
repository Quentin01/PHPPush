var PHPPush = {};

JSON.stringify = JSON.stringify || function (obj) {  
    var t = typeof (obj);  
    if (t != "object" || obj === null) {  
        // simple data type  
        if (t == "string") obj = '"'+obj+'"';  
        return String(obj);  
    }  
    else {  
        // recurse array or object  
        var n, v, json = [], arr = (obj && obj.constructor == Array);  
        for (n in obj) {  
            v = obj[n]; t = typeof(v);  
            if (t == "string") v = '"'+v+'"';  
            else if (t == "object" && v !== null) v = JSON.stringify(v);  
            json.push((arr ? "" : '"' + n + '":') + String(v));  
        }  
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");  
    }  
};  

PHPPush.events = {};

PHPPush.connect = function(link, rate) {
	if(rate === undefined)
		var rate = 2000;
	
	PHPPush.link = link;
	PHPPush.rate = rate;
	
	PHPPush.emit('connection');
};

PHPPush.launch = function() {
	PHPPush.load();
};

PHPPush.load = function()
{
	var xhr = PHPPush.getXHR();
	xhr.open('POST', PHPPush.link);
	
	xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
			console.log('Log : ' + xhr.responseText);
			var events = (JSON != undefined) ? JSON.parse(xhr.responseText) : eval('('+xhr.responseText+')');
			
			for (var i = 0, c = events.length; i < c; i++) {
				PHPPush.dealEvent(events[i]['event'], events[i]['data']);
			}
			
			setTimeout(function() { PHPPush.load() }, PHPPush.rate);
        }
    };
    
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send('get=true');
}

PHPPush.emit = function(name, data)
{
	if(data === undefined)
		var data = false;
	
	var xhr = PHPPush.getXHR();
	
	xhr.open('POST', PHPPush.link);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send('event=' + encodeURIComponent(name) +'&data=' + encodeURIComponent(JSON.stringify(data)));
};

PHPPush.on = function(name, callback)
{
	PHPPush.events[name] = callback;
}

PHPPush.dealEvent = function(name, data)
{
	data = (JSON != undefined) ? JSON.parse(data) : eval('('+data+')');
	
	if(PHPPush.events[name] !== undefined)
		PHPPush.events[name](data);
};

PHPPush.getXHR = function()
{
	var xhr = null;
	
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
	} else {
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	
	return xhr;
}
