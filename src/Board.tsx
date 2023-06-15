import React, { useState, useEffect, useRef } from 'react';
import { useDraw } from './hooks/useDraw';
import { Draw, Point } from './types/typing';
import { ChromePicker } from 'react-color';

const Board: React.FC = () => {
  const [color, setColor] = useState<string>('#000');
  const { canvasRef, onMouseDown, clear } = useDraw(drawLine);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerWidth });

  useEffect(() => {
    if (canvasWrapperRef.current) {
      const { clientWidth } = canvasWrapperRef.current;
      const canvasWidth = clientWidth * 0.50; // half of screen width
      const canvasHeight = canvasWidth; // Square aspect ratio

      setCanvasSize({ width: canvasWidth, height: canvasHeight });
    }
  }, []);

  function drawLine({ prevPoint, currentPoint, ctx }: Draw) {
    const { x: currX, y: currY } = currentPoint;

    const lineColor = color;

    const lineWidth = 5;

    let startPoint = prevPoint ?? currentPoint;

    ctx.beginPath();

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);

    ctx.lineTo(currX, currY);

    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
  }

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center my-20">
      <div className="flex flex-col gap-10 pr-10">
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button className="btn btn-active btn-primary" onClick={clear}>Clear Canvas</button>
      </div>
      <div ref={canvasWrapperRef}>
        <canvas
          onMouseDown={onMouseDown}
          ref={canvasRef}
          height={canvasSize.height}
          width={canvasSize.width}
          className="border border-black rounded-md"
        />
      </div>
    </div>
  );
};

export default Board;
