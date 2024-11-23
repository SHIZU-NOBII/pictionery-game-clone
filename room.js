import DrawAbleCanvas from "./drawableCanvas.js"
import { io, Socket } from "socket.io-client";

// WHEN IN PRODUCTION MODE 
const production = process.env.NODE_ENV === 'production'
const ServerUrl = production ? 'Example.com' : 'http://localhost:3000'

const socket = io(ServerUrl)

const canvas = document.querySelector('[data-canvas]')
const wordElem = document.querySelector('[data-word]')
const MessageElem = document.querySelector('[data-msg]')
const guessForm = document.querySelector('[data-guess-form]')
const guessInput = document.querySelector('[data-guess-input]')
const readyButton = document.querySelector('[data-ready-btn]')
const guessTemplate = document.querySelector('[data-guess-template]')

const drawAbleCanvas = new DrawAbleCanvas(canvas, socket)


const urlParams = new URLSearchParams(window.location.search)

const name = urlParams.get('name')
const roomId = urlParams.get('room-id')

if(!name || !roomId){
    return window.location = '/index.html'
}

// SEND THE URL DATA TO SERVER 
socket.emit('join-room', {name : name, roomId: roomId})

// GET EVENT FROM THE SERVER TO DRAW
socket.on('start-drawer' , startRoundDrawer)

// GET EVENT FROM THE SERVER TO GUESS
socket.on('start-guesser', startRoundGuesser)

// GET THE GUEESER NAME AND GUESS WORD FROM THE SERVER
socket.on('guess', displayGuess)

// GET THE WINNER AND THE WORD FROM SERVER ANS SHOW IT TO ALL USER
socket.on('winner', endRound)

function controlHTMLEvents() {
    readyButton.addEventListener('click' , ()=>{
        hide(readyButton)
        socket.emit('ready')
    })

    guessForm.addEventListener('submit', e=>{
        e.preventDefault()

        if(guessInput.value == null) return

        socket.emit('make-guess', {guess : guessInput.value})

        displayGuess(name, guessInput.value)

        guessInput.value = ''
    })

    window.addEventListener('resize', settingCanvas)
}

settingCanvas()
endRound()
controlHTMLEvents()



// START DRAWER FUNCTION
function startRoundDrawer(word){
    drawAbleCanvas.canDraw = true
    drawAbleCanvas.clearCanvas()

    wordElem.textContent = word

    MessageElem.innerHTML = ''
}

// START GUESSER FUNCTION
function startRoundGuesser(){
    show(guessForm)
    hide(wordElem)
    drawAbleCanvas.clearCanvas()
    MessageElem.innerHTML = ''
    wordElem.innerText = ""
}

// SETTING CANVAS WIDTH AND HEIGHT
function settingCanvas(){
   canvas.width = null
   canvas.hight = null
   const canvasRect = canvas.getBoundingClientRect()
   canvas.width = canvasRect.width 
   canvas.height = canvasRect.height 
}

// FUNCTION TO HIDE FORM INITIALLY AND ON ROUND END
function endRound(name , word) {
    if(name && word) {
        wordElem.innerText = word
        show(wordElem)
        displayGuess(null, `${name} IS THE WINNER`)
    }
    
    drawAbleCanvas.canDraw = false

    hide(guessForm)
    show(readyButton)
}

function hide(elem){
    elem.classList.add('hide')
}

function show(elem){
    elem.classList.remove('hide')
}

// GUESS SHOW 
function displayGuess(guesserName, guessWord){
    const guessElem = guessTemplate.content.cloneNode(true)
    const name = guessElem.querySelector('[data-name]')
    name.innerText = guesserName
    const guess = guessElem.querySelector('[data-text]')
    guess.innerText = guessWord
    MessageElem.append(guessElem)
}
