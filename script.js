window.onload = on();
function setWzor(){
	document.getElementById("wzor").addEventListener("click",function(){
		patternEvent();
	});
}
function restart(elWidth = 500, elHeight = 200){
	document.getElementById("res").addEventListener("click",function(){
		new make("pattern",250,100).init();
		new make("image",elWidth,elHeight).init();
	});
}
function setClear(){
	document.getElementById("clear").addEventListener("click",function(){
		var x = getRects("pattern");
		for(var i=0;i<x.length;i++){
			var oneRect = x[i];
			if(oneRect.getAttribute("fill") == "purple"){
				oneRect.setAttribute("fill","transparent");
			}
		}
	});
}
function imageEvent(){
	var x = getRects("image");
	var pos=[[10000,10000],[0,0]];
	var oneRect, cords;
	for(let i=0;i<x.length;i++){
		oneRect = x[i];
		if(oneRect.getAttribute("fill") == "purple"){
			cords = getPosition(x[i]);
			pos=compare(pos,cords);
		}
	}
	var color=createColor();
	for(var j=0;j<x.length;j++){
		oneRect = x[j];
		cords = getPosition(oneRect);
		if(compare2(pos,cords)){
			if(oneRect.getAttribute("class")=="a"){
				oneRect.setAttribute("fill",color);
			}
			if(oneRect.getAttribute("fill")==color){
				oneRect.setAttribute("class","b");
			}
		}
	}
	document.getElementById("image").getElementsByTagName("svg")[0].innerHTML+="";
	addEvents("mouseover",x,function(){draw(this);});
	var els = document.getElementById("image").getElementsByTagName("rect");
	for(let i=0;i<els.length;i++){
		if(els[i].getAttribute("class")=="b"){
			els[i].addEventListener("mousedown",fillTransparent);
		}
	}
}
function test(pos){
	var x = getRects("image");
	var color=createColor();
	for(var j=0;j<x.length;j++){
		var oneRect = x[j];
		var cords= getPosition(oneRect);
		if(compare2(pos,cords)){
			if(oneRect.getAttribute("class")=="a"){
				oneRect.setAttribute("fill",color);
			}
			if(oneRect.getAttribute("fill")==color){
				oneRect.setAttribute("class","b");
			}
		}
	}
	document.getElementById("image").getElementsByTagName("svg")[0].innerHTML+="";
	addEvents("mouseover",x,function(){draw(this);});
	var els = document.getElementById("image").getElementsByTagName("rect");
	for(var i=0;i<els.length;i++){
		if(els[i].getAttribute("class")=="b"){
			els[i].addEventListener("mousedown",fillTransparent);
		}
	}
	return;
}
function absolutePos(pos){
	var x = pos[0];
	var y = pos[1];
	return [[0,0],[Math.abs(x[0]-y[0]),Math.abs(x[1]-y[1])]];
}
function fillWithPattern(pat){
	var xSize = pat[1][0]+20;
	var ySize = pat[1][1]+20;
	var width = 500;
	var height = 200;
	do{
		test(pat);
		pat[0][0]+=xSize;
		pat[1][0]+=xSize;
		if(pat[1][0]>=width+xSize){
			pat[0][1]+=ySize;
			pat[1][1]+=ySize;
			pat[1][0]=xSize-20;
			pat[0][0]=0;
		}
		else{
			test(pat);
			pat[0][0]+=xSize;
			pat[1][0]+=xSize;
		}
	}while(pat[1][1]<height+ySize || pat[1][0]<width+xSize);
}

function getRects(id){
	return document.getElementById(id).getElementsByTagName("svg")[0].getElementsByTagName("rect");
}
function patternEvent(){
	var x = getRects("pattern");
	var pos=[[10000,10000],[0,0]];
	var oneRect, cords;
	for(let i=0;i<x.length;i++){
		oneRect = x[i];
		if(oneRect.getAttribute("fill") == "purple"){
			cords = getPosition(x[i]);
			pos=compare(pos,cords);
		}
	}
	console.log("pos "+pos,absolutePos(pos));
	fillWithPattern(absolutePos(pos));
	var color=createColor();
	for(var j=0;j<x.length;j++){
		oneRect = x[j];
		cords = getPosition(oneRect);
		if(compare2(pos,cords)){
			if(oneRect.getAttribute("class")=="a"){
				oneRect.setAttribute("fill",color);
			}
			if(oneRect.getAttribute("fill")==color){
				oneRect.setAttribute("class","b");
			}
		}
	}
	document.getElementById("pattern").getElementsByTagName("svg")[0].innerHTML+="";
	addEvents("mouseover",x,function(){draw(this);});
	var els = getRects("pattern");
	for(let i=0;i<els.length;i++){
		if(els[i].getAttribute("class")=="b"){
			els[i].addEventListener("mousedown",fillTransparent);
		}
	}
}
function fillTransparent(){
	var time = new Date().getTime();
	var x = this.getAttribute("data-time");
	this.setAttribute("data-time",time);
	if(time-x<500){
		var color = this.getAttribute("fill");
		var els = getRects("image");
		for(var i=0;i<els.length;i++){
			if(els[i].getAttribute("fill")==color)
				els[i].setAttribute("fill","transparent");
		}
	}
}
function createColor(){
	var rand = Math.random();
	while(rand<0.1){
		rand = Math.random();
	}
	return "#"+(rand*0xFFFFFF<<0).toString(16);
}
function compare(pos,cords){
	if(pos[0][0]>cords[0])
		pos[0][0]=cords[0];
	if(pos[0][1]>cords[1])
		pos[0][1]=cords[1];
	if(pos[1][0]<cords[0])
		pos[1][0]=cords[0];
	if(pos[1][1]<cords[1])
		pos[1][1]=cords[1];
	return pos;

}
function compare2(pos,cords){
	if(pos[1][0]>=cords[0] && pos[1][1]>=cords[1]){
		if(pos[0][0]<=cords[0] && pos[0][1]<=cords[1]){
			return true;
		}
		else{return false;}
	}
	else{return false;}
}
function getPosition(self){
	return [Number(self.getAttribute("x")),Number(self.getAttribute("y"))];
}
function addEvents(type,list,event){
	for(var i=0;i<list.length;i++){
		var oneRect = list[i];
		if(oneRect.getAttribute("class")=="a")
			oneRect.addEventListener(type,event);
	}
}
function on(elWidth = 500, elHeight = 200){
	setWzor();
	setClear();
	restart(elWidth, elHeight);
	document.getElementById("pattern").addEventListener("mousedown",function(){
		this.setAttribute("data-click-status","1");
	});
	document.getElementById("image").addEventListener("mousedown",function(){
		this.setAttribute("data-click-status","1");
	});
	document.getElementById("pattern").addEventListener("mouseup",function(){
		this.setAttribute("data-click-status","0");
	});
	document.getElementById("image").addEventListener("mouseup",function(){
		this.setAttribute("data-click-status","0");
		imageEvent();
	});
	new make("pattern",250,100).init();
	new make("image",elWidth,elHeight).init();
}
function make(id,width,height){
	var self=this;
	this.width=width;
	this.height=height;
	this.id=id;
	this.squares=function(){
		var elems="";
		for(var i=0;i<self.width/20;i++){
			for(var j=0;j<self.height/20;j++){
				elems+=makeSquare(20*i,20*j);
			}
		}
		return elems;
	};
	this.setParams=function(){
		var elems = self.squares();
		var el=document.getElementById(self.id).getElementsByTagName("svg")[0];
		el.innerHTML="";
		el.innerHTML+=elems;
		el.setAttribute("viewBox", "0 0 "+self.width+" "+self.height+"");
		el.setAttribute("width", self.width +"px");
		el.setAttribute("height",self.height+ "px");
	};
	this.init=function(){
		self.setParams();
		var rects = getRects("pattern");
		addEvents("mouseover",rects,function(){draw(this);});

	};
}
function draw(self){
	var status=self.parentNode.parentNode.getAttribute("data-click-status");
	if(status=="1")
		self.setAttribute("fill","purple");
}
function makeSquare(i,j) {
	return "<rect x=\""+i+"\" y=\""+j+"\" width=\"20\" height=\"20\" stroke-width=\"0px\" stroke=\"black\" class=\"a\" fill=\"transparent\"/>";
}
module.exports.on = on;
