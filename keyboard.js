/*
*/

$(function() {
    $('body').on('keydown',keydown)
    $('body').on('keyup',keyup)
    $('body').on('mousedown',Start)
});

keys = [
    'q', '2', 'w', 'e', '4', 'r', '5', 't', 'y', '7', 'u', '8', 'i', '9', 'o', 'p',
    'z', 's', 'x', 'c', 'f', 'v', 'g', 'b', 'n', 'j', 'm', 'k', ',', 'l', '.', '/'
]

notes = [
    'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A2', 'A2#', 'B2', 'C2',
    'A2', 'A2#', 'B2', 'C2', 'C2#', 'D2', 'D2#', 'E2', 'F2', 'F2#', 'G2', 'G2#', 'A3', 'A3#', 'B3', 'C3', 'C3#'
]

function key2c(key){
    var ind = keys.indexOf(key)
    if(ind >= 0)
  	return notes[ind]
    else
  	return null
}

function keydown(e){
    e.preventDefault()
    var c = key2c(e.key)
    if(c){
  	for(var s=0;s<9;s++){
  	    gain[c+s].gain.value = keygain(osc[c+s].frequency.value)
  	}
    }
}
function keyup(e){
    e.preventDefault()
    var c = key2c(e.key)
    if(c){
  	for(var s=0;s<9;s++){
  	    gain[c+s].gain.value = 0.0
  	}
    }
}

function keygain(freq){
    freq = Number(freq)
    var l = (Math.log(freq) - Math.log(440)) / Math.log(2)
    return (1 / 2 ** Math.abs(l)) * 0.1 // ゲインを下げる!
}

function keyhandler(e){
    var c = e.target.id
    
    if(e.type == 'mousedown'){
  	for(var s=0;s<9;s++){
            gain[c+s].gain.value = keygain(osc[c+s].frequency.value)
  	}
    }
    if(e.type == 'mouseup'){
  	for(var s=0;s<9;s++){
  	    gain[c+s].gain.value = 0.0
  	}
    }
}
function setkey(c,freq){
    //$('<span>').text(c)
  	//.appendTo($('body'))
  	//.on('mousedown',keyhandler)
  	//.on('mouseup',keyhandler)
  	//.attr('id',c)
    $('body').append($('<span> </span>'))
    for(var s=0;s<9;s++){
  	gain[c+s] = new GainNode(audioctx);
  	//gain[c+s] = audioctx.createGain();
  	gain[c+s].gain.value = 0.0
  	osc[c+s] = new OscillatorNode(audioctx);
  	//osc[c+s] = audioctx.createOscilator();
  	osc[c+s].frequency.value = freq * (4 ** Number(s)) / 16.0
  	osc[c+s].connect(gain[c+s]).connect(audioctx.destination);
  	osc[c+s].start();
    }
}

function Start() {
    osc = {}
    gain = {}
    audioctx = new AudioContext();       // AudioContext を作成
    for(var i=0;i<notes.length;i++){
  	if(i < 16){
      	    setkey(notes[i],440 * (2.0 ** (i / 12.0)))
  	}
  	else {
      	    setkey(notes[i],440 * (2.0 ** ((i-4) / 12.0)))
  	}
    }
}
