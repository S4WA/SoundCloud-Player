document.addEventListener("DOMContentLoaded",()=>{init();$("#store").on("click",()=>{openURL("https://chrome.google.com/webstore/detail/soundcloud-player/oackhlcggjandamnkggpfhfjbnecefej")});$("#drip").on("click",()=>{openURL("https://twitter.com/AkibaKaede")})});window.onload=()=>{setInterval(function(){chrome.storage.sync.get(null,function(items){if(items.artwork!=null&&items.artwork!=artworkElem.src){artworkElem.src=items.artwork}
if(items.track!=null&&items.track!=trackElem.innerText){trackElem.innerText=items.track}
if(items.playing!=null){toggleElem.value=!items.playing?"Play":"Pause"}
if(items.favorite!=null){favElem.value=!items.favorite?"Fav":"unFav"}
if(items.shuffle!=null){shuffleElem.value=items.shuffle?"Shuffled":"Shuffle"}
if(items.repeat!=null){repeatElem.value=items.repeat=="none"?"Repeat":"Repeat ("+items.repeat+")"}
json=items})},500);ready=!0}
function init(){chrome.storage.sync.get(null,(items)=>{json=items});chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length==0){json.artwork="";json.track="* none *";chrome.storage.sync.set(json,null)}});$("#version").text("v"+chrome.runtime.getManifest().version);registerElements();$(toggleElem).on("click",()=>{toggle()});$(prevElem).on("click",()=>{queue("prev")});$(nextElem).on("click",()=>{queue("next")});$(favElem).on("click",()=>{toggleFav()});$(trackElem).on("click",()=>{openSCTab()});$(repeatElem).on("click",()=>{repeat()});$(shuffleElem).on("click",()=>{queue("shuffle")})}
function queue(request){if(!ready)return;request=request.toLowerCase();chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length!=0)chrome.tabs.sendMessage(results[0].id,request.toLowerCase(),null)})}
function openSCTab(){chrome.tabs.query({url:"*://soundcloud.com/*"},(results)=>{if(results.length!==0){chrome.tabs.update(results[0].id,{active:!0},(tab)=>{})}else{chrome.tabs.create({url:"https://soundcloud.com"},(tab)=>{})}})}
function openURL(link){chrome.tabs.create({url:link},(tab)=>{})}
function toggleFav(){if(favElem==null)return;var rString=favElem.value=="Fav"?"unFav":"Fav";queue(favElem.value=rString)}
function repeat(){if(repeatElem==null)return;repeatElem.value=(json.repeat==null&&json.repeat!="none"?"Repeat":"Repeat ("+json.repeat+")");queue("repeat")}
function toggle(){if(toggleElem==null)return;var rString=toggleElem.value=="Pause"?"Play":"Pause";queue(toggleElem.value=rString)}
function registerElements(){artworkElem=$("#artwork")[0];trackElem=$("#track")[0];toggleElem=$("#toggle")[0];prevElem=$("#prev")[0];nextElem=$("#next")[0];favElem=$("#fav")[0];repeatElem=$("#repeat")[0];shuffleElem=$("#shuffle")[0]}
var ready=!1,json,artworkElem,trackElem,toggleElem,prevElem,nextElem,favElem,repeatElem,shuffleElem