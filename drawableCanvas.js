export default function DrawAbleCanvas(canvas, socket){
    this.canDraw = false
    this.clearCanvas = function (){
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0,0 , canvas.width, canvas.height)
    }
    let previousPosition = null

    canvas.addEventListener('mousemove', e=>{
        if(e.buttons !== 1 || !this.canDraw){ 
            previousPosition = null
            return
        }

        console.log('True')
        const newPosition = {x: e.layerX, y: e.layerY}
        if(previousPosition != null){
            drawLines(previousPosition, newPosition)
            socket.emit('draw', {start: normalizePosition(previousPosition), end: normalizePosition(newPosition)})
        }
        
        previousPosition = newPosition
    })
    
    canvas.addEventListener('mouseleave', ()=> {
        previousPosition = null
    })

    socket.on('draw-line',(start, end) => drawLines(toCanvasSpace(start), toCanvasSpace(end)))
    
    function drawLines(previousPosition, newPosition){
        const ctx = canvas.getContext("2d")
        ctx.beginPath()
        ctx.moveTo(previousPosition.x, previousPosition.y)
        ctx.lineTo(newPosition.x, newPosition.y)
        ctx.stroke()
    }

    function normalizePosition(position){
        return {
            x : position.x / canvas.width,
            y : position.y / canvas.height
        }
    }
    
    function toCanvasSpace(position){
        return {
            x : position.x * canvas.width,
            y : position.y * canvas.height
        }
    }
}

