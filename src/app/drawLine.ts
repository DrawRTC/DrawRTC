import type { Draw } from '../types/typing'

type DrawLineProps = Draw & {
    color: string
    brushSize: number
  }
  
  export const drawLine = ({ prevPoint, currentPoint, ctx, color, brushSize }: DrawLineProps) => {
    const { x: currX, y: currY } = currentPoint
    const lineColor = color
    const lineWidth = brushSize
  
    let startPoint = prevPoint ?? currentPoint
    ctx.beginPath()
    ctx.lineCap = 'round'
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor
    ctx.moveTo(startPoint.x, startPoint.y)
    ctx.lineTo(currX, currY)
    ctx.stroke()
  
    ctx.fillStyle = lineColor
    ctx.beginPath()
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI)
    ctx.fill()
  }