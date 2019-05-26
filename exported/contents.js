window.onload=()=>{setInterval(()=>{update()},500)}
function update(){var playing=$(".playControl")[0].title=="Pause current",track=$("a.playbackSoundBadge__titleLink")[0].title+" By "+$("a.playbackSoundBadge__lightLink")[0].title,artwork=$(".playbackSoundBadge span.sc-artwork").css("background-image").replace("url(\"","").replace("\")","").replace("50x50.","500x500."),fav=$(".playControls__soundBadge .sc-button-like")[0].title=="Unlike",current=$(".playbackTimeline__timePassed span[aria-hidden]").text(),end=$(".playbackTimeline__duration span[aria-hidden]").text(),volume=Number($(".volume__sliderWrapper").attr("aria-valuenow"))*100;if(json.track!=track){json.track=track;json.artwork=artwork;post()}
if(json.playing!=playing){json.playing=playing;post()}
if(json.favorite!=fav){json.favorite=fav;post()}
if(json.time.current!=current){json.time.current=current;post()}
if(json.time.end!=end){json.time.end=end;post()}
if(json.volume!=volume){json.volume=volume;post()}}
function post(){chrome.storage.sync.set(json,null)}
chrome.runtime.onMessage.addListener((request,sender,callback)=>{switch(request.toLowerCase()){case "play":case "pause":{$(".playControl.sc-ir.playControls__control.playControls__play")[0].click();json.playing=!json.playing;post();break}
case "prev":{$(".playControls__prev")[0].click();break}
case "next":{$(".playControls__next")[0].click();break}
case "unfav":case "fav":{$(".playbackSoundBadge__like")[0].click();json.favorite=$(".playbackSoundBadge__like")[0].title=="Unlike";post();break}
case "repeat":{var btn=$(".repeatControl")[0];btn.click();json.repeat=btn.className.replace("repeatControl sc-ir m-","").toLowerCase();post();break}
case "shuffle":{var btn=$(".shuffleControl")[0];btn.click();json.shuffle=btn.className.includes("m-shuffling");post();break}
default:{break}}});var json={"playing":!1,"track":null,"artwork":null,"favorite":!1,"shuffle":!1,"repeat":"none","time":{"current":null,"end":null},"volume":0}