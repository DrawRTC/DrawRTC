import React, { useState, useEffect } from 'react';
import { useDraw } from '../hooks/useDraw';
import { Draw, Point } from '../types/typing';
import { ChromePicker } from 'react-color';
import { io } from 'socket.io-client';
import { drawLine } from '../app/drawLine'

const socket = io('http://localhost:3001');

type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const Board: React.FC = () => {
  const [color, setColor] = useState<string>('#000');
  const { canvasRef, onMouseDown, clear } = useDraw(drawLine);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    socket.emit('client-ready');

    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return;
      console.log('sending canvas state');
      socket.emit('canvas-state', canvasRef.current.toDataURL());
    });

    socket.on('canvas-state-from-server', (state: string) => {
      console.log('I received the state');
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on(
      'draw-line',
      ({ prevPoint, currentPoint, color }: DrawLineProps) => {
        if (!ctx) return console.log('no ctx here');
        drawLine({ prevPoint, currentPoint, ctx, color });
      }
    );

    socket.on('clear', clear);

    return () => {
      socket.off('draw-line');
      socket.off('get-canvas-state');
      socket.off('canvas-state-from-server');
      socket.off('clear');
    };
  }, [canvasRef]);

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
    <div className='w-screen h-screen bg-white flex justify-center items-center'>
      <div className='flex flex-col gap-10 pr-10'>
        <ChromePicker
          color={color}
          onChange={(e) => setColor(e.hex)}
        ></ChromePicker>
        <button
          type='button'
          className='p-2 rounded-md border border-black'
          onClick={clear}
        >
          Clear Canvas
        </button>
      </div>
      <canvas
        onMouseDown={onMouseDown}
        ref={canvasRef}
        height={750}
        width={750}
        className='border border-black rounded-md'
      />
    </div>
  );
};

export default Board;
