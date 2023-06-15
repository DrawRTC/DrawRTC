import React, { useState, useEffect, useRef } from 'react';
import { useDraw } from '../hooks/useDraw';
import { Draw, Point } from '../types/typing';
import { ChromePicker, SketchPicker, CompactPicker } from 'react-color';
import { io } from 'socket.io-client';
import { drawLine } from '../app/drawLine';

const socket = io('http://localhost:8083');

type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const Board: React.FC = () => {
  const [color, setColor] = useState<string>('#000');
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

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
      drawLine({ prevPoint, currentPoint, ctx, color });
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
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  useEffect(() => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;

    const resizeCanvas = () => {
      if (!container || !canvas) return;

      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasRef]);
  return (
    <>
      <div style={{ backgroundColor: `${color}` }} className="navbar bg-base-200 flex items-center justify-items-center">
        <div className="flex-1">
          <a className="btn bg-black border-none normal-case tracking-wider text-4xl">DrawRTC</a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal flex space-x-4 items-center justify-items-center">
            <li>
              <details className="bg-base-100 rounded-lg hover:bg-base-100">
                <summary className="bg-base-100 text-md btn py-3.5 text-center font-bold align-middle">
                  CHOOSE COLOR
                </summary>
                <ul>
                  <li><CompactPicker color={color} onChange={(e) => setColor(e.hex)} /></li>
                </ul>
              </details>
            </li>
            <button
              className='btn btn-warning text-center align-middle'
              onClick={() => socket.emit('clear')}>
              Clear canvas
            </button>
          </ul>
        </div>
      </div>
      <div className='w-screen h-screen bg-white flex justify-center items-center'>
        <div
          ref={canvasContainerRef}
          style={{ overflow: 'auto' }}
          className='border border-black rounded-md'
        >
          <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} onMouseDown={onMouseDown} />
        </div>
      </div>
    </>
  );
};

export default Board;
