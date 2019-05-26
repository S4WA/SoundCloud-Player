document.addEventListener("DOMContentLoaded",()=>{init();update();setInterval(()=>{update()},500);ready=!0});function update(){chrome.storage.sync.get(null,function(items){if(!ready)return;if((items.artwork!=null&&items.artwork!="")&&items.artwork!=artworkElem.src){artworkElem.src=items.artwork}
if(items.track!=null&&items.track!=trackElem.innerText){trackElem.innerText=items.track}
if(items.playing!=null){toggleElem.value=!items.playing?"Play":"Pause"}
if(items.favorite!=null){favElem.value=!items.favorite?"Fav":"unFav"}
if(items.shuffle!=null){shuffleElem.value=items.shuffle?"Shuffled":"Shuffle"}
if(items.repeat!=null){repeatElem.value="Repeat ("+items.repeat+")"}
if(items.time!=null){var timeJson=items.time;if($("#current").text()!=timeJson.current){$("#current").text(timeJson.current)}
if($("#end").text()!=timeJson.end){$("#end").text(timeJson.end)}}
if(items.volume!=null){$("#volume").text(items.volume+" %")}
json=items})}
function init(){chrome.storage.sync.get(null,(items)=>{json=items});chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length==0){ready=!1;json.artwork="";json.track="* Click to Open SoundCloud *";json.time=null;json.volume=0;chrome.storage.sync.set(json,null);$("#close").remove();$("#second br:last-child").remove();$("#controller").remove();$("hr:first-child").remove()}});$("#version").text("v"+chrome.runtime.getManifest().version);registerElements();registerEvents()}
function registerEvents(){$(toggleElem).on("click",()=>{toggle()});$(prevElem).on("click",()=>{queue("prev")});$(nextElem).on("click",()=>{queue("next")});$(favElem).on("click",()=>{toggleFav()});$(trackElem).on("click",()=>{openSCTab()});$(artworkElem).on("click",()=>{openSCTab()});$(repeatElem).on("click",()=>{repeat()});$(shuffleElem).on("click",()=>{queue("shuffle")});$("#store").on("click",()=>{openURL("https://chrome.google.com/webstore/detail/soundcloud-player/oackhlcggjandamnkggpfhfjbnecefej")});$("#drip").on("click",()=>{openURL("https://twitter.com/AkibaKaede")});$("#close").on("click",()=>{chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length!=0){chrome.tabs.remove(results[0].id,()=>{})}})})}
function queue(request){if(!ready)return;request=request.toLowerCase();chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length!=0)chrome.tabs.sendMessage(results[0].id,request.toLowerCase(),null)})}
function openSCTab(){chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length!==0){chrome.tabs.update(results[0].id,{active:!0},(tab)=>{})}else{chrome.tabs.create({url:"https://soundcloud.com"},(tab)=>{})}
window.close()})}
function openURL(link){chrome.tabs.create({url:link},(tab)=>{})}
function toggleFav(){if(favElem==null)return;var string=favElem.value=="Fav"?"unFav":"Fav";queue(favElem.value=string)}
function repeat(){if(json.repeat==null||repeatElem==null)return;queue("repeat");update();repeatElem.value="Repeat ("+json.repeat+")"}
function toggle(){if(toggleElem==null)return;var string=toggleElem.value=="Pause"?"Play":"Pause";queue(toggleElem.value=string)}
function registerElements(){artworkElem=$("#artwork")[0];trackElem=$("#track")[0];toggleElem=$("#toggle")[0];prevElem=$("#prev")[0];nextElem=$("#next")[0];favElem=$("#fav")[0];repeatElem=$("#repeat")[0];shuffleElem=$("#shuffle")[0]}
var ready=!1,json={},artworkElem,trackElem,toggleElem,prevElem,nextElem,favElem,repeatElem,shuffleElem