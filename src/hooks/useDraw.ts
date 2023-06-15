import { useEffect, useRef, useState } from "react"
import {Draw, Point} from '../types/typing'

export const useDraw = (onDraw:({ctx, currentPoint, prevPoint} : Draw) => void) => {
    const [mouseDown, setMouseDown] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<null | Point>(null)

    const onMouseDown = () => setMouseDown(true)

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if(!ctx) return 

        ctx.clearRect(0,0,canvas.width, canvas.height)
    }
    useEffect(() => {
        const handler = (e: MouseEvent | TouchEvent) => {
            if (!mouseDown) return
            const currentPoint = computePointInCanvas(e)
            console.log(currentPoint)
            const ctx = canvasRef.current?.getContext('2d')

            if(!ctx || !currentPoint) return

            onDraw({ctx, currentPoint, prevPoint: prevPoint.current})
            prevPoint.current = currentPoint
        }

        const computePointInCanvas = (e: any) => {
            const canvas = canvasRef.current
            if(!canvas) return

            const rect = canvas.getBoundingClientRect()

            const x = e.clientX - rect.left || e.touches[0].clientX
            const y = e.clientY - rect.top || e.touches[0].clientX

            return {x,y}
        }

        const mouseUpHandler = () => {
            setMouseDown(false)
            prevPoint.current = null
        }

        //Add event listenner
        canvasRef.current?.addEventListener('mousemove', handler)
        window.addEventListener('mouseup', mouseUpHandler)

        canvasRef.current?.addEventListener('touchmove', handler)
        window.addEventListener('touchstart', mouseUpHandler)
        

        return () => {
            canvasRef.current?.removeEventListener('mousemove', handler)
            window.removeEventListener('mouseup', mouseUpHandler)

            canvasRef.current?.addEventListener('touchmove', handler)
            window.addEventListener('touchstart', mouseUpHandler)
        }
    }, [onDraw])

    return {canvasRef, onMouseDown, clear}
}