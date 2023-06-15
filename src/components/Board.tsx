import React, { useState, useEffect, useRef } from 'react';
import { useDraw } from '../hooks/useDraw';
import { Draw, Point } from '../types/typing';
import { io } from 'socket.io-client';
import { drawLine } from '../app/drawLine';
import SelectionBar from './SelectionBar'

const socket = io('http://localhost:8083');

type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const Board: React.FC = () => {
  const [color, setColor] = useState<string>('#000');
  const [brushSize, setBrushSize] = useState<number>(5)
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

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

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return console.log('no ctx here');
      drawLine({ prevPoint, currentPoint, ctx, color, brushSize });
    });

    socket.on('clear', clear);

    return () => {
      socket.off('draw-line');
      socket.off('get-canvas-state');
      socket.off('canvas-state-from-server');
      socket.off('clear');
    };
  }, [canvasRef]);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', { prevPoint, currentPoint, color });
    drawLine({ prevPoint, currentPoint, ctx, color, brushSize });
  }

  return (
    <>
      <SelectionBar color={color} setColor={setColor} socket={socket} setBrushSize={setBrushSize}/>
      <canvas className='border border-none overflow-scroll bg-white' ref={canvasRef} width={5000} height={5000} onMouseDown={onMouseDown} />
    </>
  );
};

export default Board;
