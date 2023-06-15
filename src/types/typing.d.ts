export type Draw = {
    ctx: CanvasRenderingContext2D
    currentPoint: Point
    prevPoint: Point | null
    color?: string
}

export type Point = {x : number, y: number}

